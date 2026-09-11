import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServicioForm } from "../../ServicioForm";
import { actualizarServicio } from "../../actions";
import * as s from "../../../../admin-styles";

export default async function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: servicio } = await supabase.from("servicios").select("*").eq("id", id).single();

  if (!servicio) notFound();

  return (
    <div style={s.container}>
      <h1 style={s.h1}>Editar servicio</h1>
      <ServicioForm servicio={servicio} action={actualizarServicio.bind(null, id)} />
    </div>
  );
}
