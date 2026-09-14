"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { requerido, precioValido, imagenValida, slugificar } from "@/lib/validation";

async function subirImagen(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null,
  carpeta: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  imagenValida(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${carpeta}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("dimesa").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error("No se pudo subir la imagen: " + error.message);
  const { data } = supabase.storage.from("dimesa").getPublicUrl(path);
  return data.publicUrl;
}

// Crea una marca nueva desde el propio formulario de producto (cuando se
// elige "+ Agregar marca nueva" en vez de una de la lista) — sube su foto
// de fondo (opcional, para el cuadro en la sección Productos) y devuelve
// el slug ya creado para usarlo como marca del producto.
async function crearMarca(
  supabase: Awaited<ReturnType<typeof createClient>>,
  nombre: string,
  file: File | null
): Promise<string> {
  const nombreLimpio = requerido(nombre, "Nombre de la marca nueva");
  const slug = slugificar(nombreLimpio);
  if (!slug) throw new Error("El nombre de la marca nueva no es válido.");

  const imagen_url = await subirImagen(supabase, file, "marcas");
  const { error } = await supabase.from("marcas").insert({ slug, nombre: nombreLimpio, imagen_url });
  if (error) {
    if (error.code === "23505") {
      throw new Error(`Ya existe una marca "${nombreLimpio}". Selecciónala de la lista en vez de crearla de nuevo.`);
    }
    throw new Error("No se pudo crear la marca: " + error.message);
  }
  return slug;
}

// Resuelve a qué marca (slug) queda el producto: si se eligió "+ Agregar
// marca nueva" en el <select>, primero la crea; si no, usa la seleccionada.
async function resolverMarca(supabase: Awaited<ReturnType<typeof createClient>>, formData: FormData): Promise<string> {
  const marcaSeleccionada = requerido(String(formData.get("marca") || ""), "Marca");
  if (marcaSeleccionada === "__nueva__") {
    return crearMarca(
      supabase,
      String(formData.get("marca_nueva_nombre") || ""),
      formData.get("marca_nueva_imagen") as File | null
    );
  }
  return marcaSeleccionada;
}

function leerCampos(formData: FormData) {
  return {
    nombre: requerido(String(formData.get("nombre") || ""), "Nombre"),
    descripcion: String(formData.get("descripcion") || "").trim(),
    precio: precioValido(String(formData.get("precio") || ""), "El precio"),
    disponible: formData.get("disponible") === "on",
  };
}

export async function crearProducto(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const marca = await resolverMarca(supabase, formData);
  const campos = leerCampos(formData);
  const imagen_url = await subirImagen(supabase, formData.get("imagen") as File | null, "productos");

  const { error } = await supabase.from("productos").insert({ ...campos, marca, imagen_url });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
  revalidatePath("/productos", "layout");
}

export async function actualizarProducto(id: string, formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const marca = await resolverMarca(supabase, formData);
  const campos = leerCampos(formData);
  const imagenNueva = await subirImagen(supabase, formData.get("imagen") as File | null, "productos");
  const imagenActual = String(formData.get("imagen_url_actual") || "") || null;

  const { error } = await supabase
    .from("productos")
    .update({ ...campos, marca, imagen_url: imagenNueva || imagenActual })
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
