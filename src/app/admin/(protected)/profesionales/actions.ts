"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { requerido, imagenValida } from "@/lib/validation";
import { unirBio } from "@/lib/bio";
import { borrarImagenStorage } from "@/lib/storage";

async function subirImagen(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  imagenValida(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `profesionales/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("dimesa").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error("No se pudo subir la imagen: " + error.message);
  const { data } = supabase.storage.from("dimesa").getPublicUrl(path);
  return data.publicUrl;
}

function leerCampos(formData: FormData) {
  const bio = unirBio(String(formData.get("bio_texto") || ""), String(formData.get("bio_frase") || ""));
  return {
    nombre: requerido(String(formData.get("nombre") || ""), "Nombre"),
    especialidad: requerido(String(formData.get("especialidad") || ""), "Especialidad"),
    descripcion: String(formData.get("descripcion") || "").trim(),
    bio: bio || null,
    disponible: formData.get("disponible") === "on",
  };
}

export async function crearProfesional(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const campos = leerCampos(formData);
  const foto_url = await subirImagen(supabase, formData.get("foto") as File | null);

  const { error } = await supabase.from("profesionales").insert({ ...campos, foto_url });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/profesionales");
  revalidatePath("/profesionales", "layout");
  revalidatePath("/reservas", "layout");
}

export async function actualizarProfesional(id: string, formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const campos = leerCampos(formData);
  const fotoNueva = await subirImagen(supabase, formData.get("foto") as File | null);
  const fotoActual = String(formData.get("foto_url_actual") || "") || null;

  const { error } = await supabase
    .from("profesionales")
    .update({ ...campos, foto_url: fotoNueva || fotoActual })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (fotoNueva && fotoActual) {
    await borrarImagenStorage(supabase, fotoActual);
  }

  revalidatePath("/admin/profesionales");
  revalidatePath("/profesionales", "layout");
  revalidatePath("/reservas", "layout");
}

export async function eliminarProfesional(id: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { data, error } = await supabase.from("profesionales").delete().eq("id", id).select("foto_url").single();
  if (error) throw new Error(error.message);
  await borrarImagenStorage(supabase, data?.foto_url);

  // Los servicios guardan el id de quienes los hacen — se saca el de esta
  // profesional para no dejar ids que ya no apuntan a nadie.
  const { data: servicios } = await supabase
    .from("servicios")
    .select("id, profesionales_ids")
    .contains("profesionales_ids", [id]);
  for (const sv of servicios ?? []) {
    await supabase
      .from("servicios")
      .update({ profesionales_ids: (sv.profesionales_ids as string[]).filter((pid) => pid !== id) })
      .eq("id", sv.id);
  }

  revalidatePath("/admin/profesionales");
  revalidatePath("/admin/servicios");
  revalidatePath("/profesionales", "layout");
  revalidatePath("/reservas", "layout");
}
