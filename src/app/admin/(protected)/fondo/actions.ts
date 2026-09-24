"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { imagenValida } from "@/lib/validation";
import { comprimirImagen } from "@/lib/imagenes";
import { borrarImagenStorage } from "@/lib/storage";

async function subirImagen(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  imagenValida(file);
  const comprimida = await comprimirImagen(Buffer.from(await file.arrayBuffer()));
  const path = `fondo/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("dimesa").upload(path, comprimida, {
    contentType: "image/jpeg",
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error("No se pudo subir la imagen: " + error.message);
  const { data } = supabase.storage.from("dimesa").getPublicUrl(path);
  return data.publicUrl;
}

// Sube la imagen nueva y la guarda como fondo de todo el sitio. Borra la
// anterior del storage una vez guardada la nueva, para no dejarla
// ocupando espacio sin que nada la use ya.
export async function actualizarFondo(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const fondoNuevo = await subirImagen(supabase, formData.get("fondo") as File | null);
  if (!fondoNuevo) {
    throw new Error("Selecciona una imagen para subir.");
  }

  const { data: actual } = await supabase.from("informacion").select("fondo_url").eq("id", 1).single();

  const { error } = await supabase.from("informacion").update({ fondo_url: fondoNuevo }).eq("id", 1);
  if (error) throw new Error(error.message);

  await borrarImagenStorage(supabase, actual?.fondo_url);

  revalidatePath("/", "layout");
}

// Vuelve al mármol de siempre (fondo-claro.webp) — borra el fondo
// personalizado de la base de datos y del storage.
export async function restaurarFondoOriginal() {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { data: actual } = await supabase.from("informacion").select("fondo_url").eq("id", 1).single();

  const { error } = await supabase.from("informacion").update({ fondo_url: null }).eq("id", 1);
  if (error) throw new Error(error.message);

  await borrarImagenStorage(supabase, actual?.fondo_url);

  revalidatePath("/", "layout");
}
