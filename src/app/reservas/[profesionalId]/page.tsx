import { redirect } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import type { Servicio } from "@/lib/types";
import { ReservasView } from "../ReservasView";

const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Esta página se genera en CADA visita (no se guarda una copia). Lo que
// muestra depende de lo que se cambia en el panel de administración (un
// producto que se oculta, un precio...), y el servidor de Hostinger corre
// varias copias del sitio a la vez, cada una con su propia memoria: una copia
// guardada se ponía al día en una y seguía vieja en las otras, así que quien
// recargaba la tienda veía el producto oculto aparecer y desaparecer durante
// casi un minuto. Sin copia guardada, todos ven siempre lo último.
export const dynamic = "force-dynamic";

// Llega desde el botón "Reservar con [nombre]" de la página de una
// profesional (/profesionales/[id]). Muestra solo los servicios donde ella
// está marcada (ver admin → Servicios). Si el ID no es válido, o esa
// profesional ya no existe o está oculta, se manda a la página general.
export default async function ReservasProfesionalPage({ params }: { params: Promise<{ profesionalId: string }> }) {
  const { profesionalId } = await params;
  if (!ES_UUID.test(profesionalId)) redirect("/reservas");

  const supabase = createPublicClient();
  const [{ data: profesional }, { data: servicios }] = await Promise.all([
    supabase.from("profesionales").select("id, nombre").eq("id", profesionalId).eq("disponible", true).maybeSingle(),
    supabase.from("servicios").select("*").order("created_at", { ascending: true }),
  ]);
  if (!profesional) redirect("/reservas");

  const lista = ((servicios ?? []) as Servicio[]).filter((sv) => (sv.profesionales_ids ?? []).includes(profesional.id));

  return <ReservasView servicios={lista} profesional={{ primerNombre: String(profesional.nombre).split(" ")[0] }} />;
}
