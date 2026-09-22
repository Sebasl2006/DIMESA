import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServicioForm } from "../../ServicioForm";
import { actualizarServicio } from "../../actions";
import * as s from "../../../../admin-styles";

export default async function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: servicio }, { data: profesionales }] = await Promise.all([
    supabase.from("servicios").select("*").eq("id", id).single(),
    supabase.from("profesionales").select("id, nombre, especialidad, disponible").order("created_at", { ascending: true }),
  ]);

  if (!servicio) notFound();

  return (
    <div style={s.container}>
      <h1 style={s.h1}>Editar servicio</h1>
      <ServicioForm servicio={servicio} profesionales={profesionales ?? []} action={actualizarServicio.bind(null, id)} />
    </div>
  );
}
