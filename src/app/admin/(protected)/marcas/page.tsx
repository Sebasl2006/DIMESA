import { createClient } from "@/lib/supabase/server";
import type { MarcaInfo } from "@/lib/types";
import { MarcasTable } from "./MarcasTable";
import * as s from "../../admin-styles";

export default async function MarcasAdminPage() {
  const supabase = await createClient();
  const [{ data: marcas, error }, { data: productos }] = await Promise.all([
    supabase.from("marcas").select("*").order("created_at", { ascending: true }),
    supabase.from("productos").select("marca"),
  ]);

  const conteoPorMarca: Record<string, number> = {};
  for (const p of productos ?? []) {
    conteoPorMarca[p.marca] = (conteoPorMarca[p.marca] ?? 0) + 1;
  }

  return (
    <div style={s.container}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ ...s.h1, margin: 0 }}>Marcas</h1>
        <p style={s.helpText}>
          Las marcas se crean desde el formulario de un producto (&quot;+ Agregar marca nueva&quot;). Eliminar una marca
          borra también todos sus productos y sus fotos, de forma definitiva.
        </p>
      </div>

      <div style={s.card}>
        {error && <div style={s.errorBox}>No se pudieron cargar las marcas: {error.message}</div>}
        {!error && <MarcasTable marcas={(marcas ?? []) as MarcaInfo[]} conteoPorMarca={conteoPorMarca} />}
      </div>
    </div>
  );
}
