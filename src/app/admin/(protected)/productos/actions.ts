"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { requerido, precioValido, imagenValida, slugificar } from "@/lib/validation";
import { borrarImagenStorage, borrarImagenesStorage } from "@/lib/storage";
import { conManejoDeErrores, exigirFilasAfectadas, idDeCreacion, refrescarSitioPublico } from "@/lib/admin-helpers";
import type { ResultadoAccion } from "@/lib/resultado";

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
    await borrarImagenStorage(supabase, imagen_url);
    if (error.code === "23505") {
      throw new Error(`Ya existe una marca "${nombreLimpio}". Selecciónala de la lista en vez de crearla de nuevo.`);
    }
    throw new Error("No se pudo crear la marca: " + error.message);
  }
  return slug;
}

// Borra una marca completa: todos sus productos, la marca y las fotos de
// ambos (base de datos y storage). Como no se puede deshacer, exige que
// se escriba el nombre de la marca — se vuelve a comprobar aquí y no solo
// en el navegador.
export async function eliminarMarca(slug: string, nombreEscrito: string): Promise<ResultadoAccion> {
  return conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);

    const { data: marca } = await supabase.from("marcas").select("nombre, imagen_url").eq("slug", slug).maybeSingle();
    if (!marca) throw new Error("No se encontró la marca.");

    if (nombreEscrito.trim().toLowerCase() !== String(marca.nombre).trim().toLowerCase()) {
      throw new Error("El nombre que escribiste no coincide. No se borró nada.");
    }

    const { data: productosBorrados, error: errorProductos } = await supabase
      .from("productos")
      .delete()
      .eq("marca", slug)
      .select("imagen_url");
    if (errorProductos) throw new Error("No se pudieron borrar los productos: " + errorProductos.message);

    // Las fotos se borran apenas se borran sus productos, aunque después
    // fallara borrar la marca.
    await borrarImagenesStorage(supabase, (productosBorrados ?? []).map((p) => p.imagen_url));

    const { data: marcaBorrada, error: errorMarca } = await supabase
      .from("marcas")
      .delete()
      .eq("slug", slug)
      .select("slug");
    if (errorMarca) throw new Error("No se pudo borrar la marca: " + errorMarca.message);
    if (!marcaBorrada || marcaBorrada.length === 0) throw new Error("No se pudo borrar la marca.");

    await borrarImagenStorage(supabase, marca.imagen_url);

    revalidatePath("/admin/marcas");
    revalidatePath("/admin/productos");
    refrescarSitioPublico();
  });
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

export async function crearProducto(formData: FormData): Promise<ResultadoAccion> {
  const resultado = await conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);

    const id = idDeCreacion(formData);
    if (id) {
      // La misma petición ya se procesó (doble clic / reenvío): no se repite.
      const { data: yaExiste } = await supabase.from("productos").select("id").eq("id", id).maybeSingle();
      if (yaExiste) return;
    }

    const marca = await resolverMarca(supabase, formData);
    const campos = leerCampos(formData);
    const imagen_url = await subirImagen(supabase, formData.get("imagen") as File | null, "productos");

    const { data, error } = await supabase
      .from("productos")
      .insert({ ...(id ? { id } : {}), ...campos, marca, imagen_url })
      .select("id");
    if (error) {
      // Otra copia de esta misma petición ganó la carrera: se descarta la foto sobrante.
      if (id && error.code === "23505") {
        await borrarImagenStorage(supabase, imagen_url);
        return;
      }
      await borrarImagenStorage(supabase, imagen_url);
      throw new Error(error.message);
    }
    exigirFilasAfectadas(data, "No se pudo crear el producto: la base de datos no aceptó el cambio (revisa que hayas iniciado sesión con un correo autorizado).");

    revalidatePath("/admin/productos");
    refrescarSitioPublico();
  });
  // El servidor mismo lleva a la lista en esta misma respuesta: antes el formulario
  // pedía la navegación aparte (router.push) y Next.js la convertía en una recarga
  // completa de la página, sumando varios segundos a cada guardado.
  if (resultado.ok) redirect("/admin/productos");
  return resultado;
}

export async function actualizarProducto(id: string, formData: FormData): Promise<ResultadoAccion> {
  const resultado = await conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);
    const marca = await resolverMarca(supabase, formData);
    const campos = leerCampos(formData);
    const imagenNueva = await subirImagen(supabase, formData.get("imagen") as File | null, "productos");
    const imagenActual = String(formData.get("imagen_url_actual") || "") || null;

    const { data, error } = await supabase
      .from("productos")
      .update({ ...campos, marca, imagen_url: imagenNueva || imagenActual })
      .eq("id", id)
      .select("id");
    if (error) {
      await borrarImagenStorage(supabase, imagenNueva);
      throw new Error(error.message);
    }
    if (!data || data.length === 0) {
      await borrarImagenStorage(supabase, imagenNueva);
      throw new Error("No se guardó ningún cambio: el producto ya no existe o tu correo no tiene permiso para editarlo.");
    }

    // Si se subió una foto nueva, la anterior ya no está referenciada por
    // nada — se borra para no dejarla ocupando espacio en el storage.
    if (imagenNueva && imagenActual) {
      await borrarImagenStorage(supabase, imagenActual);
    }

    revalidatePath("/admin/productos");
    refrescarSitioPublico();
  });
  // El servidor mismo lleva a la lista en esta misma respuesta: antes el formulario
  // pedía la navegación aparte (router.push) y Next.js la convertía en una recarga
  // completa de la página, sumando varios segundos a cada guardado.
  if (resultado.ok) redirect("/admin/productos");
  return resultado;
}

export async function eliminarProducto(id: string): Promise<ResultadoAccion> {
  return conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);
    const { data, error } = await supabase.from("productos").delete().eq("id", id).select("imagen_url");
    if (error) throw new Error(error.message);
    exigirFilasAfectadas(data, "No se eliminó nada: el producto ya no existe o tu correo no tiene permiso para eliminarlo.");
    await borrarImagenStorage(supabase, data?.[0]?.imagen_url);
    revalidatePath("/admin/productos");
    refrescarSitioPublico();
  });
}
