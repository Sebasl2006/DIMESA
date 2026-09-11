"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface VideoHeroProps {
  src: string;
  // Texto/contenido superpuesto sobre el video (título + descripción,
  // por ejemplo). Aparece de inmediato al cargar, con un fade-in propio
  // — a diferencia de "children", NO espera a que el video termine.
  overlay?: ReactNode;
  // Tapa la marca de agua (estrella) que dejan los videos generados con
  // IA — posicionado a mano sobre esa estrella en los videos actuales
  // (~87% del ancho, ~83% del alto). Si el video cambia de encuadre,
  // este porcentaje puede necesitar un ajuste.
  cornerLogo?: string;
  children: ReactNode;
}

// Video de introducción a pantalla completa: se reproduce una sola vez
// (autoplay, muted, sin loop) y al terminar revela el resto de la página
// con un fade-in suave + scroll automático hacia el contenido. Mismo
// patrón que el hero de video de la landing (/).
export function VideoHero({ src, overlay, cornerLogo, children }: VideoHeroProps) {
  const [revealed, setRevealed] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  // Intentamos arrancar CON sonido — como se llega aquí haciendo clic en el
  // cuadro de la marca, ese clic cuenta como interacción real y la mayoría
  // de navegadores (Chrome incluido) sí permiten el audio en ese caso. Si
  // el navegador de todos modos lo bloquea (ej. alguien entra por link
  // directo, sin haber hecho clic antes), cae solo a silencioso — eso
  // SIEMPRE está permitido — y el botón queda para que lo reactive a mano.
  const [muted, setMuted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setOverlayVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      });
    }
  }, []);

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          background: "#0b0a09",
        }}
      >
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="auto"
          onEnded={reveal}
          onError={reveal}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />

        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Activar sonido" : "Silenciar"}
          style={{
            position: "absolute",
            top: "94px",
            right: "24px",
            zIndex: 4,
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "1px solid rgba(201,168,118,0.4)",
            background: "rgba(11,10,9,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: overlayVisible ? 1 : 0,
            transition: "opacity 1.1s ease, background-color 0.2s ease",
          }}
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e6d3ac" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4V5z" />
              <line x1="16" y1="9" x2="22" y2="15" />
              <line x1="22" y1="9" x2="16" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e6d3ac" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 010 7" />
              <path d="M18.5 6a9 9 0 010 12" />
            </svg>
          )}
        </button>

        {overlay && (
          <>
            {/* Degradado oscuro sutil, solo donde va el texto (esquina
                inferior izquierda) — no tapa el video, solo refuerza el
                contraste detrás de las letras. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                background:
                  "linear-gradient(0deg, rgba(11,10,9,0.82) 0%, rgba(11,10,9,0.4) 38%, rgba(11,10,9,0) 62%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "flex-start",
                padding: "0 6vw 12vh",
                boxSizing: "border-box",
                opacity: overlayVisible ? 1 : 0,
                transform: overlayVisible ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 1.1s ease, transform 1.1s ease",
              }}
            >
              {overlay}
            </div>
          </>
        )}

        {cornerLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cornerLogo}
            alt=""
            style={{
              position: "absolute",
              left: "92%",
              top: "83%",
              transform: "translate(-50%, -50%)",
              width: "110px",
              height: "auto",
              zIndex: 3,
              opacity: overlayVisible ? 1 : 0,
              transition: "opacity 1.1s ease",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      <div
        ref={contentRef}
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 1s ease, transform 1s ease",
          pointerEvents: revealed ? "auto" : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}
