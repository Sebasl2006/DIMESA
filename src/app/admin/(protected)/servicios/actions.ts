"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { requerido, precioValido, enumValido, imagenValida } from "@/lib/validation";
import { borrarImagenStorage } from "@/lib/storage";
import type { Categoria } from "@/lib/types";

const CATEGORIAS_VALIDAS: readonly Categoria[] = ["capilar", "facial", "corporal", "masajes"];

async function subirImagen(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  imagenValida(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `servicios/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("dimesa").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error("No se pudo subir la imagen: " + error.message);
  const { data } = supabase.storage.from("dimesa").getPublicUrl(path);
  return data.publicUrl;
}

function leerCampos(formData: FormData) {
  return {
    nombre: requerido(String(formData.get("nombre") || ""), "Nombre"),
    descripcion: String(formData.get("descripcion") || "").trim(),
    precio_desde: precioValido(String(formData.get("precio_desde") || ""), "El precio"),
    categoria: enumValido(String(formData.get("categoria") || ""), CATEGORIAS_VALIDAS, "Categoría"),
  };
}

// Solo se guardan ids de profesionales que existen de verdad — el
// formulario del navegador se puede saltar con una petición hecha a mano.
async function idsProfesionalesElegidos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData
): Promise<string[]> {
  const elegidos = formData.getAll("profesionales_ids").map(String);
  if (elegidos.length === 0) return [];
  const { data, error } = await supabase.from("profesionales").select("id").in("id", elegidos);
  if (error) throw new Error("No se pudieron verificar las profesionales elegidas.");
  return (data ?? []).map((p) => p.id as string);
}

export async function crearServicio(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const campos = leerCampos(formData);
  const profesionales_ids = await idsProfesionalesElegidos(supabase, formData);
  const imagen_url = await subirImagen(supabase, formData.get("imagen") as File | null);

  const { error } = await supabase.from("servicios").insert({ ...campos, profesionales_ids, imagen_url });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/servicios");
  revalidatePath("/reservas");
}

export async function actualizarServicio(id: string, formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const campos = leerCampos(formData);
  const profesionales_ids = await idsProfesionalesElegidos(supabase, formData);
  const imagenNueva = await subirImagen(supabase, formData.get("imagen") as File | null);
  const imagenActual = String(formData.get("imagen_url_actual") || "") || null;

  const { error } = await supabase
    .from("servicios")
    .update({ ...campos, profesionales_ids, imagen_url: imagenNueva || imagenActual })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (imagenNueva && imagenActual) {
    await borrarImagenStorage(supabase, imagenActual);
  }

  revalidatePath("/admin/servicios");
  revalidatePath("/reservas");
}

export async function eliminarServicio(id: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { data, error } = await supabase.from("servicios").delete().eq("id", id).select("imagen_url").single();
  if (error) throw new Error(error.message);
  await borrarImagenStorage(supabase, data?.imagen_url);
  revalidatePath("/admin/servicios");
  revalidatePath("/reservas");
}
