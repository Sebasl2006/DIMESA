import { createPublicClient } from "@/lib/supabase/server";
import type { Informacion } from "@/lib/types";

const FONDO_POR_DEFECTO = "/images/fondo-claro.webp";

interface FondoLayerProps {
  // Variante usada dentro de la sección "Información" del inicio (ver
  // .dimesa-bg-layer-section en globals.css) — el resto de páginas usa la
  // variante normal, fija a toda la pantalla.
  section?: boolean;
}

// Capa de fondo (mármol) que se repite en todas las páginas públicas
// salvo el video del inicio. La imagen sale de la tabla "informacion"
// (editable en /admin/fondo); si nadie ha subido una, cae a la imagen de
// mármol de siempre — así nunca queda sin fondo.
// El fondo casi nunca cambia, pero se consultaba a la base de datos en CADA
// visita de CADA página. Se recuerda 20 segundos en la memoria del servidor:
// un cambio hecho en /admin/fondo se ve en menos de 20 s, y cada página se
// ahorra una consulta.
let fondoRecordado: { url: string; hasta: number } | null = null;
const SEGUNDOS_RECORDADO = 20;

async function leerFondo(): Promise<string> {
  if (fondoRecordado && fondoRecordado.hasta > Date.now()) return fondoRecordado.url;
  const supabase = createPublicClient();
  const { data } = await supabase.from("informacion").select("fondo_url").eq("id", 1).single();
  const url = (data as Pick<Informacion, "fondo_url"> | null)?.fondo_url || FONDO_POR_DEFECTO;
  fondoRecordado = { url, hasta: Date.now() + SEGUNDOS_RECORDADO * 1000 };
  return url;
}

export async function FondoLayer({ section = false }: FondoLayerProps) {
  const fondo = await leerFondo();

  return (
    <div
      className={section ? "dimesa-bg-layer-section" : "dimesa-bg-layer"}
      style={{ backgroundImage: `url(${fondo})` }}
    />
  );
}
