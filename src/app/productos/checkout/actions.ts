"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { requerido } from "@/lib/validation";
import type { LineaPedido } from "@/lib/types";

interface CrearPedidoInput {
  nombre: string;
  correo: string;
  telefono: string;
  entrega: "domicilio" | "recogida";
  provincia: string;
  ciudad: string;
  direccion: string;
  referencia: string;
  metodoPago: "tarjeta" | "transferencia";
  lineas: LineaPedido[];
}

// Guarda el pedido usando la service_role key (ignora RLS) — es la única
// forma en que un pedido llega a la base de datos; el navegador nunca
// puede insertar en "pedidos" directamente (ver supabase/schema.sql).
// Con tarjeta el cobro se confirma antes de llegar aquí, así que el
// pedido nace "pagado". Con transferencia no hay forma de confirmar el
// depósito automáticamente — el pedido nace "pendiente" hasta que el
// admin revise el comprobante que el cliente envía por WhatsApp.
// TODO (Etapa 4 — pago real con PayPhone): antes de cobrar de verdad,
// recalcular cada precio contra la tabla "productos" en vez de confiar
// en el precio que manda el carrito, y solo insertar el pedido como
// "pagado" después de confirmar el cobro contra la API de PayPhone.
export async function crearPedido(input: CrearPedidoInput) {
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

  const total = input.lineas.reduce((sum, l) => sum + l.precio * l.cantidad, 0);
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("El total del pedido no es válido.");
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("pedidos").insert({
    cliente_nombre: nombre,
    cliente_email: correo,
    cliente_telefono: telefono,
    cliente_provincia: provincia,
    cliente_ciudad: ciudad,
    cliente_direccion: direccion,
    cliente_referencia: referencia,
    productos: input.lineas,
    total: Math.round(total * 100) / 100,
    estado: input.metodoPago === "transferencia" ? "pendiente" : "pagado",
    estado_envio: "pendiente",
    metodo_pago: input.metodoPago,
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
