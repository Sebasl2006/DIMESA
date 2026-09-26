"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { requerido, imagenValida } from "@/lib/validation";
import { borrarImagenStorage } from "@/lib/storage";
import { conManejoDeErrores, exigirFilasAfectadas, refrescarSitioPublico } from "@/lib/admin-helpers";
import type { ResultadoAccion } from "@/lib/resultado";

async function subirImagen(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  imagenValida(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `informacion/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("dimesa").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error("No se pudo subir la imagen: " + error.message);
  const { data } = supabase.storage.from("dimesa").getPublicUrl(path);
  return data.publicUrl;
}

function parsearCuentas(raw: string): { banco: string; tipo_cuenta: string; numero_cuenta: string; identificacion: string }[] {
  let lista: unknown;
  try {
    lista = JSON.parse(raw || "[]");
  } catch {
    throw new Error("Las cuentas bancarias no se enviaron correctamente.");
  }
  if (!Array.isArray(lista)) return [];
  return lista.map((c) => ({
    banco: String((c as Record<string, unknown>)?.banco ?? "").trim(),
    tipo_cuenta: String((c as Record<string, unknown>)?.tipo_cuenta ?? "").trim(),
    numero_cuenta: String((c as Record<string, unknown>)?.numero_cuenta ?? "").trim(),
    identificacion: String((c as Record<string, unknown>)?.identificacion ?? "").trim(),
  }));
}

export async function actualizarInformacion(formData: FormData): Promise<ResultadoAccion> {
  return conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);

    const fotoNueva = await subirImagen(supabase, formData.get("foto") as File | null);
    const fotoActual = String(formData.get("foto_url_actual") || "") || null;

    const campos = {
      titulo: requerido(String(formData.get("titulo") || ""), "Título"),
      descripcion: String(formData.get("descripcion") || "").trim(),
      direccion: String(formData.get("direccion") || "").trim(),
      horario: String(formData.get("horario") || "").trim(),
      telefono: String(formData.get("telefono") || "").trim(),
      foto_url: fotoNueva || fotoActual,
      cuentas_bancarias: parsearCuentas(String(formData.get("cuentas_bancarias") || "[]")),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("informacion").update(campos).eq("id", 1).select("id");
    if (error) {
      await borrarImagenStorage(supabase, fotoNueva);
      throw new Error(error.message);
    }
    if (!data || data.length === 0) {
      await borrarImagenStorage(supabase, fotoNueva);
      throw new Error("No se guardó ningún cambio: tu correo no tiene permiso para editar la información del sitio.");
    }

    if (fotoNueva && fotoActual) {
      await borrarImagenStorage(supabase, fotoActual);
    }

    revalidatePath("/admin/informacion");
    refrescarSitioPublico();
  });
}
