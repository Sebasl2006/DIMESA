import { createClient } from "@/lib/supabase/server";
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
export async function FondoLayer({ section = false }: FondoLayerProps) {
  const supabase = await createClient();
  const { data } = await supabase.from("informacion").select("fondo_url").eq("id", 1).single();
  const fondo = (data as Pick<Informacion, "fondo_url"> | null)?.fondo_url || FONDO_POR_DEFECTO;

  return (
    <div
      className={section ? "dimesa-bg-layer-section" : "dimesa-bg-layer"}
      style={{ backgroundImage: `url(${fondo})` }}
    />
  );
}
