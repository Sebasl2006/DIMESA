import { createClient } from "@/lib/supabase/server";
import type { MarcaInfo } from "@/lib/types";
import { ProductoForm } from "../ProductoForm";
import { crearProducto } from "../actions";
import * as s from "../../../admin-styles";

export default async function NuevoProductoPage() {
  const supabase = await createClient();
  const { data: marcas } = await supabase.from("marcas").select("*").order("created_at", { ascending: true });

  return (
    <div style={s.container}>
      <h1 style={s.h1}>Agregar producto</h1>
      <ProductoForm marcas={(marcas ?? []) as MarcaInfo[]} action={crearProducto} />
    </div>
  );
}
