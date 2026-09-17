"use server";

import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requerido } from "@/lib/validation";
import { CARGO_ENVIO_DOMICILIO } from "@/lib/constants";
import { prepararPagoPayphone, confirmarPagoPayphone } from "@/lib/payphone";
import type { LineaPedido } from "@/lib/types";

interface DatosPedidoInput {
  nombre: string;
  correo: string;
  telefono: string;
  entrega: "domicilio" | "recogida";
  provincia: string;
  ciudad: string;
  direccion: string;
  referencia: string;
  lineas: LineaPedido[];
}

// Valida los datos del cliente y vuelve a consultar cada producto en la
// base de datos — nunca se confía en el nombre/precio que manda el
// navegador, alguien podría cambiarlos desde las herramientas de
// desarrollador antes de enviar el pedido y pagar menos de lo real.
// Comparten esto tanto el pedido por transferencia como el pago con
// tarjeta (Payphone), para no verificar los precios de dos formas distintas.
async function verificarYCalcular(input: DatosPedidoInput) {
  const nombre = requerido(input.nombre, "Nombre");
  const correo = requerido(input.correo, "Correo");
  const telefono = requerido(input.telefono, "Teléfono");

  let provincia = "";
  let ciudad = "";
  let direccion = "";
  let referencia = "";
  if (input.entrega === "domicilio") {
    provincia = requerido(input.provincia, "Provincia");
    ciudad = requerido(input.ciudad, "Ciudad");
    direccion = requerido(input.direccion, "Dirección");
    referencia = requerido(input.referencia, "Referencia");
  }

  if (!input.lineas || input.lineas.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  const supabase = createServiceRoleClient();
  const idsUnicos = [...new Set(input.lineas.map((l) => l.producto_id))];
  const { data: productosReales, error: errorProductos } = await supabase
    .from("productos")
    .select("id, nombre, precio, disponible")
    .in("id", idsUnicos);

  if (errorProductos) {
    console.error("Error al verificar productos del pedido:", errorProductos);
    throw new Error("No pudimos verificar tu pedido en este momento. Intenta de nuevo.");
  }

  const productoPorId = new Map((productosReales ?? []).map((p) => [p.id, p]));

  const lineasVerificadas: LineaPedido[] = input.lineas.map((l) => {
    const real = productoPorId.get(l.producto_id);
    if (!real || !real.disponible) {
      throw new Error(`"${l.nombre}" ya no está disponible. Quítalo del carrito e intenta de nuevo.`);
    }
    return {
      producto_id: real.id,
      nombre: real.nombre,
      precio: real.precio,
      cantidad: Math.max(1, Math.round(l.cantidad)),
    };
  });

  // El cargo de envío a domicilio se decide aquí, nunca con un valor que
  // mande el navegador — así nadie puede quitárselo manipulando la petición.
  const cargoEnvio = input.entrega === "domicilio" ? CARGO_ENVIO_DOMICILIO : 0;
  const total = lineasVerificadas.reduce((sum, l) => sum + l.precio * l.cantidad, 0) + cargoEnvio;
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("El total del pedido no es válido.");
  }

  return {
    nombre,
    correo,
    telefono,
    provincia,
    ciudad,
    direccion,
    referencia,
    lineasVerificadas,
    cargoEnvio,
    total: Math.round(total * 100) / 100,
  };
}

// En producción SIEMPRE se usa el dominio real fijo — nunca el header
// "Host" de la petición, que en teoría alguien podría falsificar con una
// petición hecha a mano (no desde el navegador) para intentar que Payphone
// redirija el pago a otro dominio. Solo en desarrollo local se arma la URL
// a partir del host de la petición, para poder probar en el puerto que sea.
async function obtenerBaseUrl() {
  if (process.env.NODE_ENV === "production") {
    return "https://dimesaspa.com";
  }
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  return `http://${host}`;
}

// Guarda el pedido usando la service_role key (ignora RLS) — es la única
// forma en que un pedido llega a la base de datos; el navegador nunca
// puede insertar en "pedidos" directamente (ver supabase/schema.sql).
// Solo para transferencia: no hay forma de confirmar el depósito
// automáticamente, así que el pedido nace "pendiente" hasta que el admin
// revise el comprobante que el cliente envía por WhatsApp. El pago con
// tarjeta ya no pasa por aquí — ver iniciarPagoTarjeta/confirmarPagoTarjeta.
export async function crearPedido(input: DatosPedidoInput) {
  const datos = await verificarYCalcular(input);
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from("pedidos").insert({
    cliente_nombre: datos.nombre,
    cliente_email: datos.correo,
    cliente_telefono: datos.telefono,
    cliente_provincia: datos.provincia,
    cliente_ciudad: datos.ciudad,
    cliente_direccion: datos.direccion,
    cliente_referencia: datos.referencia,
    productos: datos.lineasVerificadas,
    cargo_envio: datos.cargoEnvio,
    total: datos.total,
    estado: "pendiente",
    estado_envio: "pendiente",
    metodo_pago: "transferencia",
  });

  if (error) {
    // El detalle técnico se queda en los logs del servidor — el cliente
    // que está pagando nunca debe ver el mensaje interno de Postgres.
    console.error("Error al guardar pedido:", error);
    throw new Error(
      "No pudimos guardar tu pedido en este momento. Intenta de nuevo en unos minutos, o escríbenos por WhatsApp."
    );
  }
}

// Paso 1 del pago con tarjeta: verifica precios, "aparca" los datos del
// pedido en pedidos_pendientes (porque Payphone redirige fuera del sitio y
// de vuelta, y para entonces esta función ya terminó de ejecutarse) y pide
// a Payphone el enlace de pago. El pedido real recién se guarda en
// confirmarPagoTarjeta, cuando Payphone confirma que sí se cobró.
export async function iniciarPagoTarjeta(input: DatosPedidoInput): Promise<{ url: string }> {
  const datos = await verificarYCalcular(input);
  const supabase = createServiceRoleClient();
  const clientTransactionId = crypto.randomUUID();

  const { error: errorPendiente } = await supabase.from("pedidos_pendientes").insert({
    client_transaction_id: clientTransactionId,
    cliente_nombre: datos.nombre,
    cliente_email: datos.correo,
    cliente_telefono: datos.telefono,
    cliente_provincia: datos.provincia,
    cliente_ciudad: datos.ciudad,
    cliente_direccion: datos.direccion,
    cliente_referencia: datos.referencia,
    productos: datos.lineasVerificadas,
    cargo_envio: datos.cargoEnvio,
    total: datos.total,
  });

  if (errorPendiente) {
    console.error("Error al crear pedido pendiente de pago:", errorPendiente);
    throw new Error("No pudimos iniciar el pago. Intenta de nuevo.");
  }

  const baseUrl = await obtenerBaseUrl();
  try {
    const { payWithCard } = await prepararPagoPayphone({
      montoCentavos: Math.round(datos.total * 100),
      clientTransactionId,
      referencia: `Pedido Dimesa - ${datos.nombre}`,
      correo: datos.correo,
      responseUrl: `${baseUrl}/productos/checkout/confirmar`,
      cancellationUrl: `${baseUrl}/productos/checkout`,
    });
    return { url: payWithCard };
  } catch (err) {
    // Si Payphone no pudo preparar el pago, no dejamos el pedido "aparcado"
    // dando vueltas sin ningún pago asociado.
    await supabase.from("pedidos_pendientes").delete().eq("client_transaction_id", clientTransactionId);
    throw err;
  }
}

interface ResultadoConfirmacion {
  ok: boolean;
  mensaje: string;
}

// Paso 2: Payphone redirige aquí con "id" y "clientTransactionId" tras el
// pago. Confirma con Payphone si se aprobó, revisa que el monto cobrado
// coincida con el pedido pendiente que se guardó en iniciarPagoTarjeta, y
// solo entonces crea el pedido real como "pagado".
export async function confirmarPagoTarjeta(id: number, clientTxId: string): Promise<ResultadoConfirmacion> {
  if (!id || !clientTxId) {
    return { ok: false, mensaje: "No pudimos identificar tu pago. Si se te cobró, escríbenos por WhatsApp." };
  }

  const supabase = createServiceRoleClient();
  const { data: pendiente } = await supabase
    .from("pedidos_pendientes")
    .select("*")
    .eq("client_transaction_id", clientTxId)
    .single();

  if (!pendiente) {
    return {
      ok: false,
      mensaje: "Tu pedido ya fue procesado o expiró. Si se te cobró, escríbenos por WhatsApp con tu comprobante.",
    };
  }

  let confirmacion;
  try {
    confirmacion = await confirmarPagoPayphone(id, clientTxId);
  } catch (err) {
    console.error("Error al confirmar pago con Payphone:", err);
    return { ok: false, mensaje: "No pudimos confirmar tu pago. Si se te cobró, escríbenos por WhatsApp." };
  }

  if (!confirmacion.aprobado) {
    await supabase.from("pedidos_pendientes").delete().eq("client_transaction_id", clientTxId);
    return { ok: false, mensaje: "Tu pago fue cancelado o no se aprobó. Puedes intentar de nuevo." };
  }

  if (confirmacion.clientTransactionId !== clientTxId) {
    // Payphone confirmó una transacción distinta a la que esperábamos —
    // no debería pasar nunca, pero si pasa, no se guarda nada solo.
    console.error("clientTransactionId de Payphone no coincide:", { esperado: clientTxId, recibido: confirmacion.clientTransactionId });
    return {
      ok: false,
      mensaje: "Hubo un problema verificando tu pago. Escríbenos por WhatsApp con tu comprobante.",
    };
  }

  const totalEsperadoCentavos = Math.round(Number(pendiente.total) * 100);
  if (confirmacion.montoCentavos !== totalEsperadoCentavos) {
    // El monto que Payphone dice haber cobrado no coincide con lo que
    // esperábamos — no se guarda el pedido solo, se necesita revisión manual.
    console.error("Monto de Payphone no coincide con el pedido pendiente:", {
      clientTxId,
      esperado: totalEsperadoCentavos,
      cobrado: confirmacion.montoCentavos,
    });
    return {
      ok: false,
      mensaje: "Hubo un problema verificando el monto de tu pago. Escríbenos por WhatsApp con tu comprobante.",
    };
  }

  // Reclamo atómico: si dos peticiones llegan a la vez para el mismo pago
  // (ej. alguien recarga la página de confirmación, o la vuelve a abrir),
  // ambas podrían pasar las validaciones de arriba antes de que cualquiera
  // termine. Este delete-con-select solo puede "ganarlo" una de las dos —
  // la otra recibe un arreglo vacío y no llega a duplicar el pedido pagado.
  const { data: reclamado } = await supabase
    .from("pedidos_pendientes")
    .delete()
    .eq("client_transaction_id", clientTxId)
    .select()
    .maybeSingle();

  if (!reclamado) {
    return {
      ok: false,
      mensaje: "Tu pedido ya fue procesado. Si no ves la confirmación, escríbenos por WhatsApp con tu comprobante.",
    };
  }

  const { error } = await supabase.from("pedidos").insert({
    cliente_nombre: reclamado.cliente_nombre,
    cliente_email: reclamado.cliente_email,
    cliente_telefono: reclamado.cliente_telefono,
    cliente_provincia: reclamado.cliente_provincia,
    cliente_ciudad: reclamado.cliente_ciudad,
    cliente_direccion: reclamado.cliente_direccion,
    cliente_referencia: reclamado.cliente_referencia,
    productos: reclamado.productos,
    cargo_envio: reclamado.cargo_envio,
    total: reclamado.total,
    estado: "pagado",
    estado_envio: "pendiente",
    metodo_pago: "tarjeta",
    payphone_transaction_id: confirmacion.transactionId,
  });

  if (error) {
    console.error("Error al guardar pedido pagado con Payphone:", error);
    return {
      ok: false,
      mensaje: "Tu pago fue aprobado pero hubo un problema guardando tu pedido. Escríbenos por WhatsApp para confirmarlo.",
    };
  }

  return { ok: true, mensaje: "Hemos recibido tu pago. Te contactaremos para confirmar la entrega o recogida en tienda." };
}
