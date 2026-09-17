"use client";

import { useState, type ChangeEvent, type MouseEvent } from "react";
import Link from "next/link";
import { useCart } from "../CartContext";
import { ImageSlot } from "@/components/ImageSlot";
import { crearPedido } from "./actions";
import { CARGO_ENVIO_DOMICILIO } from "@/lib/constants";
import type { CuentaBancaria } from "@/lib/types";

const fmt = (n: number) => "$" + n.toFixed(2);

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "593983163000";
function waHref(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const PROVINCIAS = [
  "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro",
  "Esmeraldas", "Galápagos", "Guayas", "Imbabura", "Loja", "Los Ríos", "Manabí",
  "Morona Santiago", "Napo", "Orellana", "Pastaza", "Pichincha", "Santa Elena",
  "Santo Domingo de los Tsáchilas", "Sucumbíos", "Tungurahua", "Zamora Chinchipe",
];

interface FormState {
  nombre: string;
  correo: string;
  telefono: string;
  provincia: string;
  ciudad: string;
  direccion: string;
  referencia: string;
  entrega: "domicilio" | "recogida";
}

const inputStyle = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "13px",
  color: "#e6d3ac",
  background: "#0b0a09",
  border: "1px solid rgba(201,168,118,0.25)",
  padding: "14px 16px",
  outline: "none",
  boxSizing: "border-box" as const,
  width: "100%",
};

interface CheckoutFormProps {
  // Dirección real del local (tabla "informacion", editable desde el
  // admin) — se muestra cuando el cliente elige recoger en tienda, para
  // que sepa a dónde ir a buscar su pedido.
  direccionLocal?: string;
  // Cuentas bancarias (tabla "informacion", editable desde el admin) —
  // se muestran cuando el cliente elige pagar por transferencia. Si el
  // admin no configuró ninguna todavía, esa forma de pago no aparece.
  cuentasBancarias?: CuentaBancaria[];
}

export function CheckoutForm({ direccionLocal, cuentasBancarias = [] }: CheckoutFormProps) {
  const { cartLines, subtotal, clearCart } = useCart();
  const [orderComplete, setOrderComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pago, setPago] = useState<"tarjeta" | "transferencia">("tarjeta");
  const [comprobanteEnviado, setComprobanteEnviado] = useState(false);
  const [form, setForm] = useState<FormState>({
    nombre: "",
    correo: "",
    telefono: "",
    provincia: "",
    ciudad: "",
    direccion: "",
    referencia: "",
    entrega: "domicilio",
  });
  const [formError, setFormError] = useState("");

  const isDomicilio = form.entrega === "domicilio";
  const cargoEnvio = isDomicilio ? CARGO_ENVIO_DOMICILIO : 0;
  const totalConEnvio = subtotal + cargoEnvio;
  const esTransferencia = pago === "transferencia";
  const setField = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // Compartida entre "Enviar comprobante" y "Confirmar pedido" — antes solo
  // el segundo la revisaba, así que por transferencia se podía mandar el
  // comprobante por WhatsApp sin haber llenado nombre/correo/teléfono (ni
  // la dirección, si eligió envío a domicilio), y el mensaje de WhatsApp
  // salía sin el nombre real de la persona.
  const validarDatos = (): string | null => {
    if (!form.nombre || !form.correo || !form.telefono) return "Completa nombre, correo y teléfono.";
    if (isDomicilio && (!form.provincia || !form.ciudad || !form.direccion || !form.referencia)) {
      return "Completa provincia, ciudad, dirección y referencia para el envío.";
    }
    return null;
  };

  const handleEnviarComprobante = (e: MouseEvent<HTMLAnchorElement>) => {
    const error = validarDatos();
    if (error) {
      e.preventDefault();
      setFormError(error);
      return;
    }
    setFormError("");
    setComprobanteEnviado(true);
  };

  const submitPayment = async () => {
    if (esTransferencia && !comprobanteEnviado) {
      setFormError("Primero envía el comprobante de pago.");
      return;
    }
    const errorDatos = validarDatos();
    if (errorDatos) {
      setFormError(errorDatos);
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      // TODO (Etapa 4): antes de guardar como "pagado" de verdad, cobrar
      // primero con PayPhone y confirmar el resultado del pago. Por ahora
      // el pedido se guarda real en Supabase con estado "pendiente"; el
      // cobro sigue simulado.
      await crearPedido({
        nombre: form.nombre,
        correo: form.correo,
        telefono: form.telefono,
        entrega: form.entrega,
        provincia: form.provincia,
        ciudad: form.ciudad,
        direccion: form.direccion,
        referencia: form.referencia,
        metodoPago: pago,
        lineas: cartLines.map((l) => ({
          producto_id: l.producto.id,
          nombre: l.producto.nombre,
          precio: l.producto.precio,
          cantidad: l.qty,
        })),
      });
      setOrderComplete(true);
      clearCart();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar el pedido. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const pillBase = {
    flex: 1,
    textAlign: "center" as const,
    fontFamily: "var(--font-montserrat), sans-serif",
    fontWeight: 400,
    fontSize: "10px",
    letterSpacing: "0.1em",
    padding: "13px 10px",
    cursor: "pointer",
    border: "1px solid #c9a876",
    transition: "background .2s, color .2s",
  };

  if (cartLines.length === 0 && !orderComplete) {
    return (
      <div style={{ paddingTop: "76px", maxWidth: "980px", margin: "0 auto", padding: "160px 24px 100px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "14px", color: "#5c5347", marginBottom: "24px" }}>
          Tu carrito está vacío.
        </div>
        <Link href="/productos" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#6b5228" }}>
          &larr; VOLVER A LA TIENDA
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "130px 24px 100px" }}>
      <Link
        href="/productos"
        style={{ display: "inline-block", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#6b5228", padding: 0, marginBottom: "40px" }}
      >
        &larr; VOLVER A LA TIENDA
      </Link>

      {orderComplete ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.3em", color: "#6b5228", marginBottom: "16px" }}>
            PEDIDO CONFIRMADO
          </div>
          <div className="font-serif" style={{ fontWeight: 300, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", color: "#3d2f1a", marginBottom: "18px" }}>
            Gracias por tu compra
          </div>
          <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 300, fontSize: "14px", color: "#5c5347", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
            {esTransferencia
              ? "Hemos recibido tu pedido. Realiza la transferencia a la cuenta indicada y envíanos el comprobante por WhatsApp para confirmarlo."
              : "Hemos recibido tu pedido. Te contactaremos para confirmar la entrega o recogida en tienda."}
          </div>
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.3em", color: "#6b5228", marginBottom: "14px" }}>
              CHECKOUT
            </div>
            <div className="font-serif" style={{ fontWeight: 300, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", color: "#3d2f1a" }}>
              Finaliza tu compra
            </div>
          </div>

          <div style={{ display: "flex", gap: "56px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "280px" }}>
              <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#6b5228", marginBottom: "20px" }}>
                RESUMEN DEL PEDIDO
              </div>
              {cartLines.map((line) => (
                <div key={line.producto.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid rgba(201,168,118,0.15)" }}>
                  <div style={{ width: "52px", height: "52px", flexShrink: 0 }}>
                    <ImageSlot src={line.producto.imagen_url} alt={line.producto.nombre} placeholder={line.producto.nombre} sizes="52px" />
                  </div>
                  <div style={{ flex: 1, fontFamily: "var(--font-montserrat), sans-serif", fontSize: "13px", color: "#3d2f1a" }}>
                    {line.producto.nombre}
                    <div style={{ fontSize: "11px", color: "#5c5347", marginTop: "4px" }}>Cantidad: {line.qty}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "13px", color: "#6b5228" }}>{fmt(line.producto.precio * line.qty)}</div>
                </div>
              ))}
              {isDomicilio && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "13px", color: "#5c5347" }}>
                  <div>Envío a domicilio</div>
                  <div>{fmt(cargoEnvio)}</div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 0 0", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "14px", letterSpacing: "0.06em", color: "#3d2f1a" }}>
                <div>TOTAL</div>
                <div>{fmt(totalConEnvio)}</div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#6b5228", marginBottom: "6px" }}>
                TUS DATOS
              </div>
              <input value={form.nombre} onChange={setField("nombre")} placeholder="Nombre completo" style={inputStyle} />
              <input value={form.correo} onChange={setField("correo")} placeholder="Correo electrónico" style={inputStyle} />
              <input value={form.telefono} onChange={setField("telefono")} placeholder="Teléfono" style={inputStyle} />

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button onClick={() => setForm((f) => ({ ...f, entrega: "domicilio" }))} style={{ ...pillBase, background: isDomicilio ? "#c9a876" : "none", color: isDomicilio ? "#0b0a09" : "#6b5228" }}>
                  ENVÍO A DOMICILIO
                </button>
                <button onClick={() => setForm((f) => ({ ...f, entrega: "recogida" }))} style={{ ...pillBase, background: !isDomicilio ? "#c9a876" : "none", color: !isDomicilio ? "#0b0a09" : "#6b5228" }}>
                  RECOGER EN TIENDA
                </button>
              </div>

              {isDomicilio && (
                <>
                  <select value={form.provincia} onChange={setField("provincia")} style={{ ...inputStyle, color: form.provincia ? "#e6d3ac" : "#5c5347" }}>
                    <option value="" disabled style={{ color: "#5c5347", background: "#0b0a09" }}>
                      Provincia
                    </option>
                    {PROVINCIAS.map((prov) => (
                      <option key={prov} value={prov} style={{ color: "#e6d3ac", background: "#0b0a09" }}>
                        {prov}
                      </option>
                    ))}
                  </select>
                  <input value={form.ciudad} onChange={setField("ciudad")} placeholder="Ciudad" style={inputStyle} />
                  <input value={form.direccion} onChange={setField("direccion")} placeholder="Dirección (calle, número, sector)" style={inputStyle} />
                  <input
                    value={form.referencia}
                    onChange={setField("referencia")}
                    placeholder='Referencia (ej: "casa azul frente al parque")'
                    style={inputStyle}
                  />
                </>
              )}

              {!isDomicilio && direccionLocal && (
                <div style={{ display: "flex", gap: "12px", padding: "16px 18px", border: "1px solid rgba(201,168,118,0.25)", background: "#141210" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a876" strokeWidth={1.4} style={{ flexShrink: 0, marginTop: "1px" }}>
                    <path d="M12 21s-7-6.5-7-11.5A7 7 0 0119 9.5C19 14.5 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.4" />
                  </svg>
                  <div>
                    <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "10px", letterSpacing: "0.14em", color: "#8a7a5c", marginBottom: "6px" }}>
                      RETIRA TU PEDIDO EN
                    </div>
                    <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 300, fontSize: "13px", color: "#e6d3ac", lineHeight: 1.6 }}>
                      {direccionLocal}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#6b5228", margin: "18px 0 -4px" }}>
                FORMA DE PAGO
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setPago("tarjeta")} style={{ ...pillBase, background: !esTransferencia ? "#c9a876" : "none", color: !esTransferencia ? "#0b0a09" : "#6b5228" }}>
                  TARJETA
                </button>
                {cuentasBancarias.length > 0 && (
                  <button onClick={() => setPago("transferencia")} style={{ ...pillBase, background: esTransferencia ? "#c9a876" : "none", color: esTransferencia ? "#0b0a09" : "#6b5228" }}>
                    TRANSFERENCIA
                  </button>
                )}
              </div>

              {esTransferencia && cuentasBancarias.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "10px", letterSpacing: "0.14em", color: "#8a7a5c" }}>
                    TRANSFIERE A CUALQUIERA DE ESTAS CUENTAS
                  </div>
                  {cuentasBancarias.map((cuenta, i) => (
                    <div
                      key={i}
                      style={{ padding: "16px 18px", border: "1px solid rgba(201,168,118,0.25)", background: "#141210", display: "flex", flexDirection: "column", gap: "8px" }}
                    >
                      {[
                        ["Banco", cuenta.banco],
                        ["Tipo de cuenta", cuenta.tipo_cuenta],
                        ["Número de cuenta", cuenta.numero_cuenta],
                        ["Cédula / RUC", cuenta.identificacion],
                      ]
                        .filter(([, valor]) => !!valor)
                        .map(([label, valor]) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "13px" }}>
                            <span style={{ color: "#8a8580" }}>{label}</span>
                            <span style={{ color: "#e6d3ac", textAlign: "right" }}>{valor}</span>
                          </div>
                        ))}
                    </div>
                  ))}
                  <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 300, fontSize: "12px", color: "#8a8580", lineHeight: 1.6 }}>
                    Realiza la transferencia y envíanos el comprobante por WhatsApp para validar tu pedido.
                  </div>
                  <a
                    href={waHref(`Hola, soy ${form.nombre}, te envío el comprobante de mi transferencia por mi pedido en Dimesa.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleEnviarComprobante}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.1em",
                      color: comprobanteEnviado ? "#0b0a09" : "#c9a876",
                      background: comprobanteEnviado ? "#c9a876" : "none",
                      border: "1px solid #c9a876",
                      padding: "14px 0",
                      textDecoration: "none",
                    }}
                  >
                    {comprobanteEnviado ? (
                      "COMPROBANTE ENVIADO ✓"
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.87.5 3.63 1.38 5.15L2 22l4.98-1.31C8.44 21.53 10.17 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.2c-.22.62-1.28 1.19-1.77 1.24-.45.05-.96.24-3.2-.68-2.7-1.11-4.44-3.86-4.58-4.04-.13-.18-1.1-1.46-1.1-2.79 0-1.32.7-1.97.94-2.24.24-.26.53-.33.7-.33.18 0 .35 0 .5.01.16.01.38-.06.6.46.22.53.75 1.83.82 1.96.07.13.11.29.02.47-.09.18-.14.29-.27.45-.14.16-.29.35-.41.47-.14.13-.28.28-.12.55.16.26.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.2 1.37.27.13.42.11.58-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.54.73 1.8.86.27.13.45.2.51.31.07.11.07.65-.15 1.27z" />
                        </svg>
                        ENVIAR COMPROBANTE
                      </>
                    )}
                  </a>
                </div>
              )}

              {formError && (
                <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "12px", color: "#a3452b", marginTop: "4px" }}>
                  {formError}
                </div>
              )}

              <button
                onClick={submitPayment}
                disabled={submitting}
                style={{
                  marginTop: "18px",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  letterSpacing: "0.16em",
                  color: "#0b0a09",
                  background: "#c9a876",
                  padding: "20px 0",
                  border: "none",
                  cursor: submitting ? "default" : "pointer",
                  width: "100%",
                  opacity: submitting ? 0.7 : esTransferencia && !comprobanteEnviado ? 0.4 : 1,
                }}
              >
                {submitting ? "PROCESANDO..." : esTransferencia ? "CONFIRMAR PEDIDO" : "PAGAR CON TARJETA"}
              </button>

              {!esTransferencia && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "6px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5c5347" strokeWidth={1.6}>
                      <rect x="5" y="11" width="14" height="9" rx="1.5" />
                      <path d="M8 11V7a4 4 0 018 0v4" />
                    </svg>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "11px", letterSpacing: "0.04em", color: "#5c5347" }}>
                      Pago seguro procesado por PayPhone
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "10px", letterSpacing: "0.08em", color: "#5c5347", border: "1px solid rgba(107,82,40,0.3)", padding: "4px 10px" }}>VISA</span>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "10px", letterSpacing: "0.08em", color: "#5c5347", border: "1px solid rgba(107,82,40,0.3)", padding: "4px 10px" }}>MASTERCARD</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
