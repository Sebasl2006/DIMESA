import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MarcaInfo } from "@/lib/types";
import { ProductoForm } from "../../ProductoForm";
import { actualizarProducto } from "../../actions";
import * as s from "../../../../admin-styles";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: producto }, { data: marcas }] = await Promise.all([
    supabase.from("productos").select("*").eq("id", id).single(),
    supabase.from("marcas").select("*").order("created_at", { ascending: true }),
  ]);

  if (!producto) notFound();

  return (
    <div style={s.container}>
      <h1 style={s.h1}>Editar producto</h1>
      <ProductoForm producto={producto} marcas={(marcas ?? []) as MarcaInfo[]} action={actualizarProducto.bind(null, id)} />
    </div>
  );
}
