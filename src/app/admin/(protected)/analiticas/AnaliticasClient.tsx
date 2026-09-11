"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";

interface PedidoRow {
  total: number;
  estado: "pendiente" | "pagado" | "cancelado";
  created_at: string;
}

type Periodo = "semana" | "mes" | "año";

// Paleta de gráficos validada con la skill de dataviz (CVD-safe) contra
// el fondo oscuro del admin (#141210) — ver notas de la conversación.
// El dorado de marca es demasiado claro/poco saturado para leerse como
// serie de datos, así que la serie de ventas usa un dorado más profundo.
const COLOR_VENTAS = "#c9a876";
const ESTADOS: { key: PedidoRow["estado"]; label: string; color: string }[] = [
  { key: "pendiente", label: "Pendiente", color: "#fab219" },
  { key: "pagado", label: "Pagado", color: "#0ca30c" },
  { key: "cancelado", label: "Cancelado", color: "#d03b3b" },
];

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mes" },
  { key: "año", label: "Año" },
];

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const fmtMoney = (n: number) =>
  "$" + n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtCompact = (n: number) => (n >= 1000 ? "$" + (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" : fmtMoney(n));

function nicaCeil(n: number): number {
  if (n <= 0) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const norm = n / pow;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * pow;
}

function getCutoff(periodo: Periodo): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (periodo === "semana") d.setDate(d.getDate() - 6);
  else if (periodo === "mes") d.setDate(d.getDate() - 29);
  else {
    d.setMonth(d.getMonth() - 11);
    d.setDate(1);
  }
  return d;
}

interface Bucket {
  key: string;
  label: string;
  total: number;
  count: number;
}

function buildBuckets(periodo: Periodo, ventas: PedidoRow[]): Bucket[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (periodo === "año") {
    const buckets: Bucket[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MESES[d.getMonth()], total: 0, count: 0 });
    }
    for (const p of ventas) {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = buckets.find((x) => x.key === key);
      if (b) {
        b.total += p.total;
        b.count += 1;
      }
    }
    return buckets;
  }

  const dias = periodo === "semana" ? 7 : 30;
  const buckets: Bucket[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({
      key: d.toISOString().slice(0, 10),
      label: periodo === "semana" ? DIAS[d.getDay()] : String(d.getDate()),
      total: 0,
      count: 0,
    });
  }
  for (const p of ventas) {
    const key = p.created_at.slice(0, 10);
    const b = buckets.find((x) => x.key === key);
    if (b) {
      b.total += p.total;
      b.count += 1;
    }
  }
  return buckets;
}

const cardStyle = { background: "#141210", border: "1px solid rgba(201,168,118,0.22)", borderRadius: "10px", padding: "24px" } as const;
const cardTitle = { fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: "13px", color: "#e6d3ac" } as const;
const axisText = { fontFamily: "var(--font-montserrat), sans-serif" } as const;

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#a8895f", marginBottom: "10px" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: "28px", color: "#e6d3ac" }}>
        {value}
      </div>
    </div>
  );
}

function VentasChart({ buckets }: { buckets: Bucket[] }) {
  const width = 760;
  const height = 260;
  const padding = { top: 16, right: 12, bottom: 26, left: 16 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const niceMax = nicaCeil(Math.max(...buckets.map((b) => b.total), 0));
  const x = (i: number) => padding.left + (buckets.length > 1 ? (i / (buckets.length - 1)) * innerW : innerW / 2);
  const y = (v: number) => padding.top + innerH - (v / niceMax) * innerH;

  const linePath = buckets.map((b, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(b.total).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${x(buckets.length - 1).toFixed(1)} ${(padding.top + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(padding.top + innerH).toFixed(1)} Z`;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMove = (e: MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    let best = Infinity;
    buckets.forEach((_, i) => {
      const d = Math.abs(x(i) - px);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setHoverIdx(nearest);
  };

  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => (niceMax / gridSteps) * i);
  const labelEvery = buckets.length > 10 ? Math.ceil(buckets.length / 7) : 1;
  const lastIdx = buckets.length - 1;

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible", cursor: "crosshair" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {gridLines.map((v, i) => (
          <g key={i}>
            <line x1={padding.left} x2={width - padding.right} y1={y(v)} y2={y(v)} stroke="rgba(201,168,118,0.12)" strokeWidth={1} />
            <text x={padding.left} y={y(v) - 4} fontSize="9" fill="#8a8580" style={axisText}>
              {fmtCompact(v)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={COLOR_VENTAS} opacity={0.1} />
        <path d={linePath} fill="none" stroke={COLOR_VENTAS} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {buckets.map((b, i) =>
          i % labelEvery === 0 || i === lastIdx ? (
            <text key={i} x={x(i)} y={height - 6} fontSize="9" fill="#8a8580" textAnchor="middle" style={axisText}>
              {b.label}
            </text>
          ) : null
        )}

        {hoverIdx !== null && (
          <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={padding.top} y2={padding.top + innerH} stroke="rgba(201,168,118,0.35)" strokeWidth={1} />
        )}

        <circle cx={x(lastIdx)} cy={y(buckets[lastIdx].total)} r={4} fill={COLOR_VENTAS} stroke="#141210" strokeWidth={2} />
        {hoverIdx !== null && hoverIdx !== lastIdx && (
          <circle cx={x(hoverIdx)} cy={y(buckets[hoverIdx].total)} r={4} fill={COLOR_VENTAS} stroke="#141210" strokeWidth={2} />
        )}
      </svg>

      {hoverIdx !== null && (
        <div
          style={{
            position: "absolute",
            left: `${(x(hoverIdx) / width) * 100}%`,
            top: 0,
            transform: "translate(-50%, -100%)",
            background: "#0b0a09",
            border: "1px solid rgba(201,168,118,0.3)",
            borderRadius: "6px",
            padding: "8px 12px",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "12px",
            color: "#e8e2d5",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            marginTop: "-8px",
          }}
        >
          <div style={{ color: "#8a8580", fontSize: "10px", marginBottom: "2px" }}>{buckets[hoverIdx].label}</div>
          <div style={{ fontWeight: 600 }}>{fmtMoney(buckets[hoverIdx].total)}</div>
        </div>
      )}
    </div>
  );
}

function EstadoChart({ pedidos }: { pedidos: PedidoRow[] }) {
  const counts = ESTADOS.map((e) => ({
    ...e,
    count: pedidos.filter((p) => p.estado === e.key).length,
    total: pedidos.filter((p) => p.estado === e.key).reduce((s, p) => s + p.total, 0),
  }));
  const maxCount = Math.max(1, ...counts.map((c) => c.count));
  const [hover, setHover] = useState<number | null>(null);

  const barW = 56;
  const gap = 44;
  const chartH = 150;
  const width = counts.length * barW + (counts.length - 1) * gap + 40;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${chartH + 34}`} style={{ width: "100%", maxWidth: "380px", height: "auto", display: "block", overflow: "visible" }}>
        {counts.map((c, i) => {
          const h = (c.count / maxCount) * (chartH - 24);
          const bx = 20 + i * (barW + gap);
          const by = chartH - h;
          return (
            <g key={c.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
              <rect x={bx - 8} y={0} width={barW + 16} height={chartH} fill="transparent" />
              <rect x={bx} y={by} width={barW} height={Math.max(h, 2)} rx={4} fill={c.color} opacity={hover === i ? 1 : 0.85} />
              <text x={bx + barW / 2} y={by - 8} textAnchor="middle" fontSize="13" fontWeight={600} fill="#e8e2d5" style={axisText}>
                {c.count}
              </text>
              <text x={bx + barW / 2} y={chartH + 18} textAnchor="middle" fontSize="11" fill="#8a8580" style={axisText}>
                {c.label}
              </text>
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <div
          style={{
            position: "absolute",
            left: `${((20 + hover * (barW + gap) + barW / 2) / width) * 100}%`,
            top: 0,
            transform: "translate(-50%, -100%)",
            background: "#0b0a09",
            border: "1px solid rgba(201,168,118,0.3)",
            borderRadius: "6px",
            padding: "8px 12px",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "12px",
            color: "#e8e2d5",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            marginTop: "-8px",
          }}
        >
          <div style={{ color: "#8a8580", fontSize: "10px", marginBottom: "2px" }}>{counts[hover].label}</div>
          <div style={{ fontWeight: 600 }}>{fmtMoney(counts[hover].total)}</div>
        </div>
      )}
    </div>
  );
}

export function AnaliticasClient({ pedidos }: { pedidos: PedidoRow[] }) {
  const [periodo, setPeriodo] = useState<Periodo>("semana");

  const filtrados = useMemo(() => {
    const cutoff = getCutoff(periodo);
    return pedidos.filter((p) => new Date(p.created_at) >= cutoff);
  }, [pedidos, periodo]);

  const ventas = useMemo(() => filtrados.filter((p) => p.estado !== "cancelado"), [filtrados]);
  const buckets = useMemo(() => buildBuckets(periodo, ventas), [periodo, ventas]);

  const totalVentas = ventas.reduce((s, p) => s + p.total, 0);
  const totalPedidos = ventas.length;
  const promedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {PERIODOS.map((p) => {
          const activo = periodo === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setPeriodo(p.key)}
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                padding: "9px 18px",
                borderRadius: "6px",
                border: `1px solid ${activo ? "#c9a876" : "rgba(201,168,118,0.22)"}`,
                background: activo ? "#c9a876" : "transparent",
                color: activo ? "#0b0a09" : "#e6d3ac",
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatTile label="Total ventas" value={fmtMoney(totalVentas)} />
        <StatTile label="Total pedidos" value={String(totalPedidos)} />
        <StatTile label="Valor promedio" value={fmtMoney(promedio)} />
      </div>

      <div style={{ ...cardStyle, marginBottom: "24px" }}>
        <div style={{ ...cardTitle, marginBottom: "20px" }}>Ventas</div>
        <VentasChart buckets={buckets} />
      </div>

      <div style={cardStyle}>
        <div style={{ ...cardTitle, marginBottom: "20px" }}>Pedidos por estado</div>
        <EstadoChart pedidos={filtrados} />
      </div>
    </div>
  );
}
