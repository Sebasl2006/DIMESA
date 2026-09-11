"use client";

import type { Producto } from "@/lib/types";
import { ImageSlot } from "@/components/ImageSlot";
import { useCart } from "../CartContext";

const fmt = (n: number) => "$" + n.toFixed(2);

export function ProductGrid({ productos }: { productos: Producto[] }) {
  const { addToCart } = useCart();

  if (productos.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "14px", color: "#5c5347" }}>
        Todavía no hay productos de esta marca.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px" }}>
      {productos.map((p) => (
        <div
          key={p.id}
          className="product-card"
          style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(201,168,118,0.15)" }}
        >
          <div style={{ width: "100%", aspectRatio: "1" }}>
            <ImageSlot
              src={p.imagen_url}
              alt={p.nombre}
              placeholder={p.nombre}
              sizes="(max-width: 480px) 95vw, (max-width: 1024px) 60vw, 560px"
            />
          </div>
          {/* Fondo sólido detrás del texto: sin esto, el texto queda flotando
              directo sobre la textura de mármol de fondo, y en algunas zonas
              el contraste se pierde casi por completo. */}
          <div style={{ background: "#141210", padding: "18px 16px 20px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            <div className="font-serif product-card-name" style={{ fontWeight: 400, fontSize: "18px", color: "#e6d3ac" }}>
              {p.nombre}
            </div>
            <div className="product-card-desc" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 300, fontSize: "12px", lineHeight: 1.6 }}>
              {p.descripcion}
            </div>
            <div className="product-card-price" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "12px", letterSpacing: "0.06em", color: "#c9a876" }}>
              {fmt(p.precio)}
            </div>
            <button
              onClick={() => addToCart(p)}
              className="product-card-btn"
              style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.14em", color: "#0b0a09", background: "#c9a876", padding: "12px 0", border: "none", cursor: "pointer", width: "100%", marginTop: "4px" }}
            >
              AGREGAR AL CARRITO
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
