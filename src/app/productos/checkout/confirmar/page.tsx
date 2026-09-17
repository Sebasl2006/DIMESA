import Link from "next/link";
import { confirmarPagoTarjeta } from "../actions";

interface PageProps {
  searchParams: Promise<{ id?: string; clientTransactionId?: string }>;
}

// A esta página Payphone redirige al cliente después de intentar el pago
// con tarjeta (ver "responseUrl" en iniciarPagoTarjeta, src/app/productos/checkout/actions.ts).
// El pedido recién se guarda acá, una vez confirmado el cobro — nunca antes.
export default async function ConfirmarPagoPage({ searchParams }: PageProps) {
  const { id, clientTransactionId } = await searchParams;
  const resultado = await confirmarPagoTarjeta(id ? Number(id) : 0, clientTransactionId ?? "");

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "130px 24px 100px" }}>
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontWeight: 400,
            fontSize: "11px",
            letterSpacing: "0.3em",
            color: "#6b5228",
            marginBottom: "16px",
          }}
        >
          {resultado.ok ? "PEDIDO CONFIRMADO" : "PAGO NO COMPLETADO"}
        </div>
        <div
          className="font-serif"
          style={{ fontWeight: 300, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", color: "#3d2f1a", marginBottom: "18px" }}
        >
          {resultado.ok ? "Gracias por tu compra" : "No pudimos completar tu pago"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontWeight: 300,
            fontSize: "14px",
            color: "#5c5347",
            maxWidth: "440px",
            margin: "0 auto 32px",
            lineHeight: 1.7,
          }}
        >
          {resultado.mensaje}
        </div>
        <Link
          href={resultado.ok ? "/productos" : "/productos/checkout"}
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontWeight: 400,
            fontSize: "11px",
            letterSpacing: "0.2em",
            color: "#6b5228",
          }}
        >
          {resultado.ok ? "← VOLVER A LA TIENDA" : "← VOLVER AL CHECKOUT"}
        </Link>
      </div>
    </div>
  );
}
