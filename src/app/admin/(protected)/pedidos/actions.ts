"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { enumValido } from "@/lib/validation";

const ESTADOS_ENVIO_VALIDOS = ["pendiente", "enviado", "finalizado"] as const;

export async function actualizarEstadoEnvio(id: string, nuevoEstado: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const estado_envio = enumValido(nuevoEstado, ESTADOS_ENVIO_VALIDOS, "Estado de envío");

  const { error } = await supabase.from("pedidos").update({ estado_envio }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}

export async function eliminarPedido(id: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { error } = await supabase.from("pedidos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/analiticas");
}
