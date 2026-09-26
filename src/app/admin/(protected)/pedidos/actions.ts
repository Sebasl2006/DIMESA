"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { enumValido } from "@/lib/validation";
import { conManejoDeErrores, exigirFilasAfectadas } from "@/lib/admin-helpers";
import type { ResultadoAccion } from "@/lib/resultado";

const ESTADOS_ENVIO_VALIDOS = ["pendiente", "enviado", "finalizado"] as const;

export async function actualizarEstadoEnvio(id: string, nuevoEstado: string): Promise<ResultadoAccion> {
  return conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);
    const estado_envio = enumValido(nuevoEstado, ESTADOS_ENVIO_VALIDOS, "Estado de envío");

    const { data, error } = await supabase.from("pedidos").update({ estado_envio }).eq("id", id).select("id");
    if (error) throw new Error(error.message);
    exigirFilasAfectadas(data, "No se guardó el cambio de estado: el pedido ya no existe o tu correo no tiene permiso.");

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${id}`);
  });
}

export async function eliminarPedido(id: string): Promise<ResultadoAccion> {
  return conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);

    const { data, error } = await supabase.from("pedidos").delete().eq("id", id).select("id");
    if (error) throw new Error(error.message);
    exigirFilasAfectadas(data, "No se eliminó el pedido: ya no existe o tu correo no tiene permiso.");

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/analiticas");
  });
}
