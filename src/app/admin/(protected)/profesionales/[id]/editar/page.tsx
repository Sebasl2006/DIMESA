import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfesionalForm } from "../../ProfesionalForm";
import { actualizarProfesional } from "../../actions";
import * as s from "../../../../admin-styles";

export default async function EditarProfesionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profesional } = await supabase.from("profesionales").select("*").eq("id", id).single();

  if (!profesional) notFound();

  return (
    <div style={s.container}>
      <h1 style={s.h1}>Editar profesional</h1>
      <ProfesionalForm profesional={profesional} action={actualizarProfesional.bind(null, id)} />
    </div>
  );
}
