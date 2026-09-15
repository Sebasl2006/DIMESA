"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Sonido de campanita (dos tonos cortos, tipo "din-don") generado con Web
// Audio — no un audio grabado. Se ve/oye parecido a una notificación de
// celular sin usar el sonido real de WhatsApp (es propiedad de Meta).
function reproducirCampanita() {
  try {
    const AudioCtxCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtxCtor();
    const tocarTono = (frecuencia: number, inicio: number, duracion: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frecuencia;
      gain.gain.setValueAtTime(0, ctx.currentTime + inicio);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + inicio + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicio + duracion);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + inicio);
      osc.stop(ctx.currentTime + inicio + duracion + 0.05);
    };
    tocarTono(1046.5, 0, 0.16); // Do
    tocarTono(1318.5, 0.13, 0.28); // Mi
  } catch {
    // Algunos navegadores bloquean sonido automático sin interacción
    // previa del usuario — no es grave, el aviso visual igual aparece.
  }
}

// Aviso tipo notificación (como una notificación de celular) que aparece
// al entrar directo a /reservas sin haber elegido profesional primero
// desde /profesionales — recuerda que se puede escoger con quién
// atenderse antes de reservar, con un enlace directo a esa página. No se
// muestra si ya se viene de la página de un profesional (ver
// reservas/page.tsx, que solo renderiza este componente cuando no hay un
// profesional ya elegido).
export function AvisoElegirProfesional() {
  const [visible, setVisible] = useState(true);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    // Espera un momento después de cargar la página (en vez de aparecer de
    // inmediato) para que se sienta como una notificación real que llega,
    // no como parte fija del diseño.
    const t = setTimeout(() => {
      setMostrar(true);
      reproducirCampanita();
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  if (!visible || !mostrar) return null;

  return (
    // position:fixed (relativo a la pantalla, no a la página) — si no, una
    // persona que ya se desplazó hacia abajo cuando suena la campanita
    // escucha el sonido pero no ve de qué se trata, porque el aviso se
    // quedó arriba en un punto de la página que ya dejó atrás. El "top"
    // cambia por media query (ver <style> abajo) porque el menú de
    // categorías de arriba pasa de 1 línea en desktop a 3 en celular, y el
    // aviso tiene que quedar siempre debajo de él sin encimarse.
    <div className="dimesa-aviso-wrap">
      <div
        role="status"
        style={{
          animation: "dimesa-aviso-entrada 0.5s ease both",
          width: "100%",
          background: "rgba(20,18,16,0.97)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(201,168,118,0.35)",
          borderRadius: "12px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          padding: "16px 16px 16px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          boxSizing: "border-box",
        }}
      >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontWeight: 300,
            fontSize: "13px",
            lineHeight: 1.6,
            color: "#e8e2d5",
          }}
        >
          Antes de reservar, no olvides escoger al profesional con el que quieres trabajar.
        </div>
        <Link
          href="/profesionales"
          onClick={() => setVisible(false)}
          style={{
            display: "inline-block",
            marginTop: "10px",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontWeight: 500,
            fontSize: "12px",
            letterSpacing: "0.08em",
            color: "#c9a876",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          HAZ CLIC AQUÍ
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
        style={{
          flexShrink: 0,
          background: "transparent",
          border: "none",
          color: "#8a8580",
          fontSize: "18px",
          lineHeight: 1,
          cursor: "pointer",
          padding: "2px 4px",
        }}
      >
        &times;
      </button>
      </div>
      <style jsx>{`
        .dimesa-aviso-wrap {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          top: 136px;
          z-index: 60;
          width: min(420px, calc(100vw - 32px));
        }
        @media (max-width: 767px) {
          .dimesa-aviso-wrap {
            top: 236px;
          }
        }
        @keyframes dimesa-aviso-entrada {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
