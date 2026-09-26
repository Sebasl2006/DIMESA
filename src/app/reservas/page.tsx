import { createPublicClient } from "@/lib/supabase/server";
import type { Servicio } from "@/lib/types";
import { ReservasView } from "./ReservasView";

// Esta página se genera en CADA visita (no se guarda una copia). Lo que
// muestra depende de lo que se cambia en el panel de administración (un
// producto que se oculta, un precio...), y el servidor de Hostinger corre
// varias copias del sitio a la vez, cada una con su propia memoria: una copia
// guardada se ponía al día en una y seguía vieja en las otras, así que quien
// recargaba la tienda veía el producto oculto aparecer y desaparecer durante
// casi un minuto. Sin copia guardada, todos ven siempre lo último.
export const dynamic = "force-dynamic";

export default async function ReservasPage() {
  const { data } = await createPublicClient()
    .from("servicios")
    .select("*")
    .order("created_at", { ascending: true });

  return <ReservasView servicios={(data ?? []) as Servicio[]} profesional={null} />;
}
