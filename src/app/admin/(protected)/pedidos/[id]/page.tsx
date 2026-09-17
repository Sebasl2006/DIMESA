import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Pedido } from "@/lib/types";
import { EstadoEnvioButtons } from "../EstadoEnvioButtons";
import * as s from "../../../admin-styles";

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  cancelado: "Cancelado",
};

const ESTADO_ENVIO_LABEL: Record<string, string> = {
  pendiente: "Envío pendiente",
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
  new Date(iso).toLocaleString("es-EC", { dateStyle: "long", timeStyle: "short" });

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={s.label}>{label}</div>
      <div style={{ fontSize: "14px", color: "#e8e2d5" }}>{valor || "—"}</div>
    </div>
  );
}

export default async function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: pedido } = await supabase.from("pedidos").select("*").eq("id", id).single();

  if (!pedido) notFound();

  const p = pedido as Pedido;
  const esDomicilio = !!p.cliente_direccion;

  return (
    <div style={s.container}>
      <Link href="/admin/pedidos" className="admin-btn-secondary" style={{ ...s.smallButton, marginBottom: "24px" }}>
        &larr; Volver a pedidos
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", marginTop: "20px" }}>
        <h1 style={{ ...s.h1, margin: 0 }}>Pedido</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={s.badge(p.estado === "pagado")}>{ESTADO_LABEL[p.estado] ?? p.estado}</span>
          <span style={s.badgeTone(ESTADO_ENVIO_TONO[p.estado_envio] ?? "muted")}>
            {ESTADO_ENVIO_LABEL[p.estado_envio] ?? p.estado_envio}
          </span>
        </div>
      </div>
      <div style={{ ...s.helpText, marginBottom: "18px" }}>{fmtFecha(p.created_at)} · ID {p.id}</div>
      <div style={{ marginBottom: "24px" }}>
        <EstadoEnvioButtons id={p.id} estadoActual={p.estado_envio} />
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ ...s.card, flex: 1, minWidth: "280px" }}>
          <div style={{ ...s.label, margin: "0 0 18px" }}>Datos del cliente</div>
          <Campo label="Nombre" valor={p.cliente_nombre} />
          <Campo label="Correo" valor={p.cliente_email} />
          <Campo label="Teléfono" valor={p.cliente_telefono} />

          <div style={{ ...s.label, margin: "26px 0 18px" }}>Entrega</div>
          <Campo label="Tipo" valor={esDomicilio ? "Envío a domicilio" : "Recoge en tienda"} />
          {esDomicilio && (
            <>
              <Campo label="Provincia" valor={p.cliente_provincia} />
              <Campo label="Ciudad" valor={p.cliente_ciudad} />
              <Campo label="Dirección" valor={p.cliente_direccion} />
              <Campo label="Referencia" valor={p.cliente_referencia} />
            </>
          )}
        </div>

        <div style={{ ...s.card, flex: 1, minWidth: "280px" }}>
          <div style={{ ...s.label, margin: "0 0 18px" }}>Productos</div>
          {p.productos.map((linea, i) => (
            <div
              key={`${linea.producto_id}-${i}`}
              style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "10px 0", borderBottom: "1px solid rgba(201,168,118,0.1)", fontSize: "14px" }}
            >
              <div style={{ color: "#e8e2d5" }}>
                {linea.nombre}
                <div style={{ fontSize: "12px", color: "#8a8580", marginTop: "2px" }}>Cantidad: {linea.cantidad}</div>
              </div>
              <div style={{ color: "#c9a876", whiteSpace: "nowrap" }}>{fmt(linea.precio * linea.cantidad)}</div>
            </div>
          ))}
          {p.cargo_envio > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "14px", color: "#8a8580" }}>
              <div>Envío a domicilio</div>
              <div>{fmt(p.cargo_envio)}</div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", marginTop: "8px", fontSize: "15px", fontWeight: 600, color: "#e6d3ac" }}>
            <div>TOTAL</div>
            <div>{fmt(p.total)}</div>
          </div>
          <Campo label="Método de pago" valor={p.metodo_pago} />
        </div>
      </div>
    </div>
  );
}
