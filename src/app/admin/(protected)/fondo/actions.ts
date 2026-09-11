"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { imagenValida } from "@/lib/validation";

async function subirImagen(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  imagenValida(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `fondo/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("dimesa").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error("No se pudo subir la imagen: " + error.message);
  const { data } = supabase.storage.from("dimesa").getPublicUrl(path);
  return data.publicUrl;
}

// Sube la imagen nueva y la guarda como fondo de todo el sitio. No borra
// la anterior del storage (igual que el resto de imágenes del admin) —
// simplemente deja de estar referenciada.
export async function actualizarFondo(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const fondoNuevo = await subirImagen(supabase, formData.get("fondo") as File | null);
  if (!fondoNuevo) {
    throw new Error("Selecciona una imagen para subir.");
  }

  const { error } = await supabase.from("informacion").update({ fondo_url: fondoNuevo }).eq("id", 1);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

// Vuelve al mármol de siempre (fondo-claro.webp) — borra el fondo
// personalizado de la base de datos.
export async function restaurarFondoOriginal() {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { error } = await supabase.from("informacion").update({ fondo_url: null }).eq("id", 1);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
