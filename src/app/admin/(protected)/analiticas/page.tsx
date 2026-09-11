import { createClient } from "@/lib/supabase/server";
import { AnaliticasClient } from "./AnaliticasClient";
import * as s from "../../admin-styles";

export default async function AnaliticasAdminPage() {
  const supabase = await createClient();

  // 13 meses de respaldo alcanza para el rango más largo del selector (año).
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 13);

  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("id, total, estado, created_at")
    .gte("created_at", desde.toISOString())
    .order("created_at", { ascending: true });

  return (
    <div style={s.container}>
      <h1 style={s.h1}>Analíticas</h1>
      {error ? (
        <div style={s.card}>
          <div style={s.errorBox}>No se pudieron cargar los pedidos: {error.message}</div>
        </div>
      ) : (
        <AnaliticasClient
          pedidos={(pedidos ?? []).map((p) => ({
            total: Number(p.total),
            estado: p.estado as "pendiente" | "pagado" | "cancelado",
            created_at: p.created_at as string,
          }))}
        />
      )}
    </div>
  );
}
