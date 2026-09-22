import { redirect } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import type { Servicio } from "@/lib/types";
import { ReservasView } from "../ReservasView";

const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Se genera una vez y se guarda; se vuelve a generar sola a lo más cada 60 s, y
// al instante cuando se guarda un cambio desde el admin (revalidatePath).
export const revalidate = 60;

// Una página por cada profesional visible; una nueva que se agregue desde el
// admin se genera en su primera visita y desde ahí queda guardada.
export async function generateStaticParams() {
  const { data } = await createPublicClient().from("profesionales").select("id").eq("disponible", true);
  return (data ?? []).map((p) => ({ profesionalId: p.id as string }));
}

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
