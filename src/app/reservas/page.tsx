import { createPublicClient } from "@/lib/supabase/server";
import type { Servicio } from "@/lib/types";
import { ReservasView } from "./ReservasView";

// Se genera una vez y se guarda; se vuelve a generar sola a lo más cada 60 s, y
// al instante cuando se guarda un cambio desde el admin (revalidatePath).
export const revalidate = 60;

export default async function ReservasPage() {
  const { data } = await createPublicClient()
    .from("servicios")
    .select("*")
    .order("created_at", { ascending: true });

  return <ReservasView servicios={(data ?? []) as Servicio[]} profesional={null} />;
}
