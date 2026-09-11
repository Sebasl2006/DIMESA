import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Pedido } from "@/lib/types";
import { DeleteButton } from "../../DeleteButton";
import { eliminarPedido } from "./actions";
import * as s from "../../admin-styles";

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  cancelado: "Cancelado",
};

const ESTADO_ENVIO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  enviado: "Enviado",
  finalizado: "Finalizado",
};

const ESTADO_ENVIO_TONO: Record<string, s.BadgeTone> = {
  pendiente: "muted",
  enviado: "gold",
  finalizado: "green",
};

const fmt = (n: number) => "$" + n.toFixed(2);
const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });

export default async function PedidosAdminPage() {
  const supabase = await createClient();
  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={s.container}>
      <h1 style={s.h1}>Pedidos</h1>

      <div style={s.card}>
        {error && <div style={s.errorBox}>No se pudieron cargar los pedidos: {error.message}</div>}

        {!error && (!pedidos || pedidos.length === 0) && (
          <p style={{ color: "#8a8580", fontSize: "14px" }}>Todavía no hay pedidos.</p>
        )}

        {!error && pedidos && pedidos.length > 0 && (
          <table style={s.table} className="admin-table">
            <thead>
              <tr>
                <th style={s.th}>Fecha</th>
                <th style={s.th}>Cliente</th>
                <th style={s.th}>Entrega</th>
                <th style={s.th}>Total</th>
                <th style={s.th}>Pago</th>
                <th style={s.th}>Envío</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {(pedidos as Pedido[]).map((p) => (
                <tr key={p.id}>
                  <td style={s.td}>{fmtFecha(p.created_at)}</td>
                  <td style={s.td}>{p.cliente_nombre}</td>
                  <td style={s.td}>{p.cliente_direccion ? "Domicilio" : "Recoge en tienda"}</td>
                  <td style={s.td}>{fmt(p.total)}</td>
                  <td style={s.td}>
                    <span style={s.badge(p.estado === "pagado")}>{ESTADO_LABEL[p.estado] ?? p.estado}</span>
                  </td>
                  <td style={s.td}>
                    <span style={s.badgeTone(ESTADO_ENVIO_TONO[p.estado_envio] ?? "muted")}>
                      {ESTADO_ENVIO_LABEL[p.estado_envio] ?? p.estado_envio}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link href={`/admin/pedidos/${p.id}`} className="admin-btn-secondary" style={s.smallButton}>
                        Ver detalle
                      </Link>
                      <DeleteButton
                        action={eliminarPedido.bind(null, p.id)}
                        confirmText={`¿Eliminar el pedido de "${p.cliente_nombre}" (${fmt(p.total)})? Esta acción no se puede deshacer y también desaparecerá de Analíticas.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
