import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Producto } from "@/lib/types";
import { ProductosTable } from "./ProductosTable";
import * as s from "../../admin-styles";

export default async function ProductosAdminPage() {
  const supabase = await createClient();
  const { data: productos, error } = await supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={s.container}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ ...s.h1, margin: 0 }}>Productos</h1>
        <Link href="/admin/productos/nuevo" className="admin-btn-primary" style={s.primaryButton}>+ Agregar producto</Link>
      </div>

      <div style={s.card}>
        {error && <div style={s.errorBox}>No se pudieron cargar los productos: {error.message}</div>}
        {!error && <ProductosTable productos={(productos ?? []) as Producto[]} />}
      </div>
    </div>
  );
}
