import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ImageSlot } from "@/components/ImageSlot";

// "marca" es un enum controlado en la base de datos (check constraint en
// productos_marca_check) y cada cuadro necesita una foto/nombre curados a
// mano — eso no se puede generar solo. Por eso una marca nueva siempre
// necesita: 1) agregarla al constraint (ALTER TABLE productos DROP/ADD
// CONSTRAINT productos_marca_check ... CHECK (marca IN (...)) en Supabase),
// 2) una entrada aquí, 3) la opción en el <select> del
// admin (ProductoForm.tsx). Lo que SÍ es dinámico es CUÁLES de estas
// tarjetas se muestran: solo las marcas que tienen al menos un producto
// disponible salen en pantalla — si vacías o desactivas todos los
// productos de una marca, su cuadro desaparece solo, sin tocar código.
// "imagen: null" muestra el placeholder genérico (nombre sobre fondo
// oscuro) hasta que subas la foto real.
const MARCA_META: Record<string, { nombre: string; imagen: string | null }> = {
  botanique: { nombre: "Botaniqué", imagen: "/images/botanique-fondo.png" },
  revlon: { nombre: "Revlon", imagen: "/images/revlon-fondo.png" },
  mq_professional: { nombre: "M|Q Professional", imagen: "/images/mq-fondo.png" },
  truss: { nombre: "TRUSS", imagen: "/images/truss-fondo.png" },
  olaplex: { nombre: "Olaplex", imagen: "/images/olaplex-fondo.png" },
};

const ORDEN_MARCAS = Object.keys(MARCA_META);

// Agrupa N marcas en filas de máximo 3, dándole el resto a las últimas
// filas — así 4 sale 2+2, 5 sale 2+3 (2 grandes arriba, 3 chicos abajo,
// como un mosaico de revista) y 6 sale 3+3, sin tener que hardcodear un
// layout distinto cada vez que se agregue una marca nueva.
function agruparEnFilas(n: number): number[] {
  if (n <= 0) return [];
  const filas = Math.max(1, Math.ceil(n / 3));
  const base = Math.floor(n / filas);
  const resto = n % filas;
  return Array.from({ length: filas }, (_, i) => base + (i >= filas - resto ? 1 : 0));
}

export default async function ProductosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("productos").select("marca").eq("disponible", true);

  const marcasConStock = new Set((data ?? []).map((p) => p.marca as string));
  const marcas = ORDEN_MARCAS.filter((slug) => marcasConStock.has(slug));

  const filas: string[][] = [];
  let cursor = 0;
  for (const tamano of agruparEnFilas(marcas.length)) {
    filas.push(marcas.slice(cursor, cursor + tamano));
    cursor += tamano;
  }

  return (
    <div style={{ paddingTop: "76px" }}>
      <div className="brand-selector">
        {filas.map((fila, i) => (
          <div key={i} className="brand-row">
            {fila.map((slug) => {
              const m = MARCA_META[slug];
              return (
                <Link key={slug} href={`/productos/${slug}`} className="brand-card">
                  <ImageSlot src={m.imagen} alt={m.nombre} placeholder="" style={{ position: "absolute", inset: 0 }} />
                  <div
                    className="brand-card-overlay"
                    style={{ position: "absolute", inset: 0, background: "rgba(11,10,9,0.3)" }}
                  />
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      height: "100%",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      padding: "0 24px 64px",
                    }}
                  >
                    <div
                      className="font-serif"
                      style={{ fontWeight: 300, fontSize: "clamp(1.5rem, 2.6vw, 2.6rem)", color: "#e6d3ac", letterSpacing: "0.05em", textAlign: "center" }}
                    >
                      {m.nombre}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
