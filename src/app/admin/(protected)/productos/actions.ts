"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { requerido, precioValido, enumValido, imagenValida } from "@/lib/validation";
import type { Marca } from "@/lib/types";

const MARCAS_VALIDAS: readonly Marca[] = ["botanique", "revlon", "mq_professional", "truss", "olaplex"];

async function subirImagen(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  imagenValida(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `productos/${crypto.randomUUID()}.${ext}`;
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
    precio: precioValido(String(formData.get("precio") || ""), "El precio"),
    marca: enumValido(String(formData.get("marca") || ""), MARCAS_VALIDAS, "Marca"),
    disponible: formData.get("disponible") === "on",
  };
}

export async function crearProducto(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const campos = leerCampos(formData);
  const imagen_url = await subirImagen(supabase, formData.get("imagen") as File | null);

  const { error } = await supabase.from("productos").insert({ ...campos, imagen_url });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
  revalidatePath("/productos", "layout");
}

export async function actualizarProducto(id: string, formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const campos = leerCampos(formData);
  const imagenNueva = await subirImagen(supabase, formData.get("imagen") as File | null);
  const imagenActual = String(formData.get("imagen_url_actual") || "") || null;

  const { error } = await supabase
    .from("productos")
    .update({ ...campos, imagen_url: imagenNueva || imagenActual })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
  revalidatePath("/productos", "layout");
}

export async function eliminarProducto(id: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/productos");
  revalidatePath("/productos", "layout");
}
