import type { CSSProperties } from "react";

// Panel admin: misma paleta e identidad tipográfica del sitio público
// (negro + dorado, Cormorant Garamond para títulos, Montserrat para el
// resto), pero con jerarquía y densidad pensadas para trabajar con datos
// a diario — no busca la misma puesta en escena que el sitio público.

const GOLD = "#c9a876";
const GOLD_SOFT = "rgba(201,168,118,0.18)";
const GOLD_BORDER = "rgba(201,168,118,0.22)";
const CREAM = "#e6d3ac";
const TEXT = "#e8e2d5";
const MUTED_LABEL = "#a8895f";
const MUTED_TEXT = "#8a8580";
const BG = "#0b0a09";
const PANEL = "#141210";
const PANEL_RAISED = "#181613";
const ERROR = "#c98a76";

// La imagen decorativa en sí vive en la capa fija ".admin-bg" (admin.css),
// con su propio filtro de brillo. Esto solo deja un color sólido de
// respaldo y coloca el contenido en su propio stacking context por
// encima de esa capa.
export const pageBackground: CSSProperties = {
  backgroundColor: BG,
  position: "relative",
  zIndex: 1,
};

export const page: CSSProperties = {
  minHeight: "100vh",
  ...pageBackground,
  fontFamily: "var(--font-montserrat), sans-serif",
  color: TEXT,
};

export const header: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 32px",
  background: PANEL,
  borderBottom: `1px solid ${GOLD_BORDER}`,
};

export const headerNav: CSSProperties = {
  display: "flex",
  gap: "28px",
  alignItems: "center",
};

export const headerLink: CSSProperties = {
  color: GOLD,
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

// Barra lateral (reemplaza la barra horizontal de arriba).
export const sidebar: CSSProperties = {
  width: "232px",
  flexShrink: 0,
  minHeight: "100vh",
  background: PANEL,
  borderRight: `1px solid ${GOLD_BORDER}`,
  display: "flex",
  flexDirection: "column",
  padding: "26px 0 20px",
  position: "sticky",
  top: 0,
  alignSelf: "flex-start",
};

export const sidebarBrand: CSSProperties = {
  fontFamily: "var(--font-cormorant), serif",
  fontWeight: 400,
  fontSize: "18px",
  letterSpacing: "0.1em",
  color: CREAM,
  padding: "0 26px",
  marginBottom: "8px",
};

export const sidebarSection: CSSProperties = {
  padding: "0 26px",
  margin: "26px 0 10px",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontWeight: 600,
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: MUTED_LABEL,
};

export const sidebarNav: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1px",
};

export const sidebarLink: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 26px",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "13px",
  fontWeight: 500,
  color: MUTED_TEXT,
  borderLeft: "2px solid transparent",
  boxSizing: "border-box",
};

export const sidebarLinkActive: CSSProperties = {
  color: CREAM,
  background: "rgba(201,168,118,0.09)",
  borderLeft: `2px solid ${GOLD}`,
};

export const sidebarFooter: CSSProperties = {
  padding: "18px 26px 0",
  marginTop: "18px",
  borderTop: `1px solid ${GOLD_BORDER}`,
};

export const container: CSSProperties = {
  maxWidth: "1080px",
  margin: "0 auto",
  padding: "44px 28px 90px",
};

export const card: CSSProperties = {
  background: PANEL,
  border: `1px solid ${GOLD_BORDER}`,
  borderRadius: "10px",
  padding: "30px",
};

export const h1: CSSProperties = {
  fontFamily: "var(--font-cormorant), serif",
  fontWeight: 300,
  fontSize: "28px",
  color: CREAM,
  margin: "0 0 26px",
  letterSpacing: "0.02em",
};

export const table: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};

export const th: CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  borderBottom: `1px solid ${GOLD_BORDER}`,
  color: MUTED_LABEL,
  fontFamily: "var(--font-montserrat), sans-serif",
  fontWeight: 500,
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export const td: CSSProperties = {
  padding: "16px",
  borderBottom: "1px solid rgba(201,168,118,0.1)",
  verticalAlign: "middle",
  color: TEXT,
};

export const thumb: CSSProperties = {
  width: "48px",
  height: "48px",
  objectFit: "cover",
  borderRadius: "6px",
  background: PANEL_RAISED,
  border: `1px solid ${GOLD_BORDER}`,
  display: "block",
};

export const thumbPlaceholder: CSSProperties = {
  ...thumb,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "9px",
  letterSpacing: "0.04em",
  color: MUTED_TEXT,
  textAlign: "center",
  padding: "2px",
};

export const badge = (ok: boolean): CSSProperties => ({
  display: "inline-block",
  padding: "4px 11px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 500,
  letterSpacing: "0.04em",
  background: ok ? "rgba(139,183,139,0.14)" : "rgba(201,138,118,0.14)",
  color: ok ? "#9fcf9f" : ERROR,
  border: `1px solid ${ok ? "rgba(139,183,139,0.3)" : "rgba(201,138,118,0.35)"}`,
});

// Igual que badge(), pero con 3 tonos en vez de solo ok/no-ok — para
// estados con más de dos pasos (p. ej. estado_envio: pendiente/enviado/finalizado).
export type BadgeTone = "muted" | "gold" | "green";

const BADGE_TONES: Record<BadgeTone, { bg: string; color: string; border: string }> = {
  muted: { bg: "rgba(138,133,128,0.14)", color: MUTED_TEXT, border: "rgba(138,133,128,0.3)" },
  gold: { bg: GOLD_SOFT, color: GOLD, border: GOLD_BORDER },
  green: { bg: "rgba(139,183,139,0.14)", color: "#9fcf9f", border: "rgba(139,183,139,0.3)" },
};

export const badgeTone = (tone: BadgeTone): CSSProperties => {
  const t = BADGE_TONES[tone];
  return {
    display: "inline-block",
    padding: "4px 11px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    background: t.bg,
    color: t.color,
    border: `1px solid ${t.border}`,
  };
};

export const primaryButton: CSSProperties = {
  display: "inline-block",
  background: GOLD,
  color: BG,
  border: "none",
  borderRadius: "6px",
  padding: "12px 22px",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.04em",
  cursor: "pointer",
  textDecoration: "none",
};

export const secondaryButton: CSSProperties = {
  display: "inline-block",
  background: "transparent",
  color: CREAM,
  border: `1px solid ${GOLD_BORDER}`,
  borderRadius: "6px",
  padding: "11px 18px",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "none",
};

export const dangerButton: CSSProperties = {
  ...secondaryButton,
  color: ERROR,
  borderColor: "rgba(201,138,118,0.35)",
};

export const smallButton: CSSProperties = {
  ...secondaryButton,
  padding: "7px 14px",
  fontSize: "12px",
};

export const label: CSSProperties = {
  display: "block",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontWeight: 500,
  fontSize: "11px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: MUTED_LABEL,
  margin: "22px 0 8px",
};

export const input: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  fontSize: "14px",
  fontFamily: "var(--font-montserrat), sans-serif",
  color: TEXT,
  background: BG,
  border: `1px solid ${GOLD_BORDER}`,
  borderRadius: "6px",
  boxSizing: "border-box",
  outline: "none",
};

export const formActions: CSSProperties = {
  display: "flex",
  gap: "12px",
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: "1px solid rgba(201,168,118,0.12)",
};

export const errorBox: CSSProperties = {
  background: "rgba(201,138,118,0.1)",
  color: "#e3b3a2",
  border: "1px solid rgba(201,138,118,0.35)",
  borderRadius: "6px",
  padding: "12px 16px",
  fontSize: "13px",
  marginBottom: "20px",
};

export const helpText: CSSProperties = {
  fontSize: "12px",
  color: MUTED_TEXT,
  marginTop: "6px",
};

export const brand: CSSProperties = {
  fontFamily: "var(--font-cormorant), serif",
  fontWeight: 400,
  fontSize: "19px",
  letterSpacing: "0.1em",
  color: CREAM,
};
