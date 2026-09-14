import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ImageSlot } from "@/components/ImageSlot";

// Las marcas viven en la tabla "marcas" (nombre + foto de fondo del cuadro),
// creadas desde el admin (Productos → Agregar producto → "+ Agregar marca
// nueva") — no hace falta tocar código para agregar una. Acá solo se
// decide CUÁLES de esas marcas se muestran: solo las que tienen al menos
// un producto disponible salen en pantalla — si vacías o desactivas todos
// los productos de una marca, su cuadro desaparece solo. Una marca sin
// foto de fondo todavía muestra el placeholder genérico (nombre sobre
// fondo oscuro) hasta que le subas una.

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
  const [{ data: productosData }, { data: marcasData }] = await Promise.all([
    supabase.from("productos").select("marca").eq("disponible", true),
    supabase.from("marcas").select("slug, nombre, imagen_url").order("created_at", { ascending: true }),
  ]);

  const marcasConStock = new Set((productosData ?? []).map((p) => p.marca as string));
  const marcaMeta = new Map((marcasData ?? []).map((m) => [m.slug, m]));
  const marcas = [...marcaMeta.keys()].filter((slug) => marcasConStock.has(slug));

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
              const m = marcaMeta.get(slug)!;
              return (
                <Link key={slug} href={`/productos/${slug}`} className="brand-card">
                  <ImageSlot src={m.imagen_url} alt={m.nombre} placeholder="" style={{ position: "absolute", inset: 0 }} />
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
