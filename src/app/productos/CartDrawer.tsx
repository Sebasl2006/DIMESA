"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { ImageSlot } from "@/components/ImageSlot";
import { ENVIO_GRATIS_DESDE } from "@/lib/constants";

const fmt = (n: number) => "$" + n.toFixed(2);

export function CartDrawer() {
  const router = useRouter();
  const { cartLines, cartCount, subtotal, drawerOpen, incQty, decQty, removeItem, clearCart, closeDrawer } = useCart();
  const hasItems = cartLines.length > 0;
  const falta = Math.max(0, ENVIO_GRATIS_DESDE - subtotal);
  const envioGratis = subtotal >= ENVIO_GRATIS_DESDE;
  const progreso = Math.min(100, (subtotal / ENVIO_GRATIS_DESDE) * 100);

  return (
    <>
      <div
        onClick={closeDrawer}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? "auto" : "none", transition: "opacity .3s ease", zIndex: 60 }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "380px",
          maxWidth: "92vw",
          background: "#141210",
          borderLeft: "1px solid rgba(201,168,118,0.22)",
          zIndex: 61,
          display: "flex",
          flexDirection: "column",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform .35s ease",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 28px", borderBottom: "1px solid rgba(201,168,118,0.15)" }}>
          <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "12px", letterSpacing: "0.2em", color: "#e6d3ac" }}>
            TU CARRITO
          </div>
          <button onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8580", fontSize: "16px" }}>
            ✕
          </button>
        </div>
        {hasItems && (
          <div style={{ padding: "16px 28px 18px", borderBottom: "1px solid rgba(201,168,118,0.15)" }}>
            <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "12px", letterSpacing: "0.04em", color: envioGratis ? "#c9a876" : "#e6d3ac", marginBottom: "10px", textAlign: "center" }}>
              {envioGratis ? "¡Tienes envío gratis!" : `Te faltan ${fmt(falta)} para envío gratis`}
            </div>
            <div style={{ height: "6px", background: "rgba(201,168,118,0.15)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${progreso}%`, height: "100%", background: "#c9a876", borderRadius: "3px", transition: "width .35s ease" }} />
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 28px" }}>
          {hasItems ? (
            cartLines.map((line) => (
              <div key={line.producto.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "18px 0", borderBottom: "1px solid rgba(201,168,118,0.1)" }}>
                <div style={{ width: "56px", height: "56px", flexShrink: 0 }}>
                  <ImageSlot src={line.producto.imagen_url} alt={line.producto.nombre} placeholder={line.producto.nombre} sizes="56px" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "13px", color: "#e6d3ac", marginBottom: "8px" }}>{line.producto.nombre}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={() => decQty(line.producto.id)} style={{ width: "22px", height: "22px", border: "1px solid rgba(201,168,118,0.4)", background: "none", color: "#c9a876", cursor: "pointer", fontSize: "13px", lineHeight: 1 }}>−</button>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "12px", color: "#8a8580", minWidth: "14px", textAlign: "center" }}>{line.qty}</span>
                    <button onClick={() => incQty(line.producto.id)} style={{ width: "22px", height: "22px", border: "1px solid rgba(201,168,118,0.4)", background: "none", color: "#c9a876", cursor: "pointer", fontSize: "13px", lineHeight: 1 }}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "13px", color: "#c9a876", marginBottom: "10px" }}>{fmt(line.producto.precio * line.qty)}</div>
                  <button onClick={() => removeItem(line.producto.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6258", fontSize: "12px" }}>✕</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "70px 0", textAlign: "center", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "13px", color: "#8a8580" }}>
              Tu carrito está vacío.
            </div>
          )}
        </div>
        <div style={{ padding: "22px 28px 28px", borderTop: "1px solid rgba(201,168,118,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "13px", letterSpacing: "0.06em", color: "#e6d3ac", marginBottom: "14px" }}>
            <div>SUBTOTAL</div>
            <div>{fmt(subtotal)}</div>
          </div>
          <button onClick={clearCart} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "11px", letterSpacing: "0.1em", color: "#8a8580", padding: 0, marginBottom: "16px" }}>
            Vaciar carrito
          </button>
          <button
            onClick={() => {
              closeDrawer();
              router.push("/productos/checkout");
            }}
            disabled={!hasItems}
            style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "13px", letterSpacing: "0.18em", color: "#0b0a09", background: "#c9a876", padding: "18px 0", border: "none", cursor: hasItems ? "pointer" : "default", width: "100%", opacity: hasItems ? 1 : 0.5 }}
          >
            PROCEDER AL PAGO
          </button>
        </div>
      </div>
    </>
  );
}
