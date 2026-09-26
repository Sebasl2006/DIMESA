"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { requerido, imagenValida } from "@/lib/validation";
import { unirBio } from "@/lib/bio";
import { borrarImagenStorage } from "@/lib/storage";
import { conManejoDeErrores, exigirFilasAfectadas, idDeCreacion, refrescarSitioPublico } from "@/lib/admin-helpers";
import type { ResultadoAccion } from "@/lib/resultado";

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

export async function crearProfesional(formData: FormData): Promise<ResultadoAccion> {
  const resultado = await conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);

    const id = idDeCreacion(formData);
    if (id) {
      const { data: yaExiste } = await supabase.from("profesionales").select("id").eq("id", id).maybeSingle();
      if (yaExiste) return;
    }

    const campos = leerCampos(formData);
    const foto_url = await subirImagen(supabase, formData.get("foto") as File | null);

    const { data, error } = await supabase
      .from("profesionales")
      .insert({ ...(id ? { id } : {}), ...campos, foto_url })
      .select("id");
    if (error) {
      await borrarImagenStorage(supabase, foto_url);
      if (id && error.code === "23505") return;
      throw new Error(error.message);
    }
    exigirFilasAfectadas(data, "No se pudo crear la profesional: la base de datos no aceptó el cambio (revisa que hayas iniciado sesión con un correo autorizado).");

    revalidatePath("/admin/profesionales");
    refrescarSitioPublico();
  });
  // El servidor mismo lleva a la lista en esta misma respuesta: antes el formulario
  // pedía la navegación aparte (router.push) y Next.js la convertía en una recarga
  // completa de la página, sumando varios segundos a cada guardado.
  if (resultado.ok) redirect("/admin/profesionales");
  return resultado;
}

export async function actualizarProfesional(id: string, formData: FormData): Promise<ResultadoAccion> {
  const resultado = await conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);
    const campos = leerCampos(formData);
    const fotoNueva = await subirImagen(supabase, formData.get("foto") as File | null);
    const fotoActual = String(formData.get("foto_url_actual") || "") || null;

    const { data, error } = await supabase
      .from("profesionales")
      .update({ ...campos, foto_url: fotoNueva || fotoActual })
      .eq("id", id)
      .select("id");
    if (error) {
      await borrarImagenStorage(supabase, fotoNueva);
      throw new Error(error.message);
    }
    if (!data || data.length === 0) {
      await borrarImagenStorage(supabase, fotoNueva);
      throw new Error("No se guardó ningún cambio: la profesional ya no existe o tu correo no tiene permiso para editarla.");
    }

    if (fotoNueva && fotoActual) {
      await borrarImagenStorage(supabase, fotoActual);
    }

    revalidatePath("/admin/profesionales");
    refrescarSitioPublico();
  });
  // El servidor mismo lleva a la lista en esta misma respuesta: antes el formulario
  // pedía la navegación aparte (router.push) y Next.js la convertía en una recarga
  // completa de la página, sumando varios segundos a cada guardado.
  if (resultado.ok) redirect("/admin/profesionales");
  return resultado;
}

export async function eliminarProfesional(id: string): Promise<ResultadoAccion> {
  return conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);
    const { data, error } = await supabase.from("profesionales").delete().eq("id", id).select("foto_url");
    if (error) throw new Error(error.message);
    exigirFilasAfectadas(data, "No se eliminó nada: la profesional ya no existe o tu correo no tiene permiso para eliminarla.");
    await borrarImagenStorage(supabase, data?.[0]?.foto_url);

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
    refrescarSitioPublico();
  });
}
