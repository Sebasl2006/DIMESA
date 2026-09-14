"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

// Solo se reproduce el video de entrada la primera vez que alguien llega a
// esta pestaña. Si ya lo vio y navega a otra sección (Reservas, Productos...)
// y vuelve al inicio, se salta directo al logo + botones — sessionStorage se
// borra al cerrar la pestaña, así que en una visita nueva sí se reproduce.
const INTRO_KEY = "dimesa-intro-vista";

export function LandingClient() {
  const [revealed, setRevealed] = useState(false);
  // Intentamos arrancar CON sonido. La mayoría de navegadores bloquean el
  // autoplay con audio sin interacción previa del usuario — si eso pasa,
  // cae solo a silencioso (eso siempre está permitido) y el botón queda
  // para que la persona lo reactive a mano. Mismo patrón que VideoHero.
  const [muted, setMuted] = useState(false);
  // El botón de sonido debe verse desde el arranque del video (no solo
  // después de que termine y se revele el resto), así que usa su propio
  // fade-in temprano en vez de depender de "revealed". No aplica cuando
  // se salta el video (introSkipped) — ahí no hay audio que controlar.
  const [buttonVisible, setButtonVisible] = useState(false);
  const [introSkipped, setIntroSkipped] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // En desarrollo, React ejecuta cada efecto dos veces seguidas al montar
  // (para ayudar a encontrar bugs) — sin este freno, la primera pasada
  // marca sessionStorage como "vista" y la segunda pasada (inmediata) lee
  // esa misma marca y cree que ya la habíamos visto antes, saltándose el
  // video incluso en la primera visita real. Este ref corta la segunda
  // pasada antes de que llegue a leer/escribir nada.
  const efectoIntroYaCorrioRef = useRef(false);

  const reveal = () => {
    if (!revealed) setRevealed(true);
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // Almacenamiento no disponible (modo privado, etc.) — sin problema,
      // simplemente se repite la intro en la próxima visita.
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setButtonVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (efectoIntroYaCorrioRef.current) return;
    efectoIntroYaCorrioRef.current = true;

    const video = videoRef.current;
    if (!video) return;

    let yaVista = false;
    try {
      yaVista = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {
      // Sin acceso a sessionStorage — se trata como primera vez.
    }

    if (yaVista) {
      setIntroSkipped(true);
      setRevealed(true);
      // Deja el fondo quieto en el último cuadro del video, como si la
      // intro ya hubiera terminado, en vez de arrancarla de nuevo.
      const mostrarUltimoCuadro = () => {
        video.currentTime = Math.max(video.duration - 0.1, 0);
      };
      if (video.readyState >= 1) mostrarUltimoCuadro();
      else video.addEventListener("loadedmetadata", mostrarUltimoCuadro, { once: true });
      return;
    }

    // Se marca como "vista" apenas arranca (no solo cuando termina) — si
    // la persona se va a otra sección antes de que acabe el video y luego
    // vuelve al inicio, ya no debe repetirse desde cero.
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // Sin acceso a sessionStorage — sin problema, ver comentario arriba.
    }

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

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const navItemStyle = (i: number): CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.9s ease ${i * 0.15}s, transform 0.9s ease ${i * 0.15}s, background-color 0.4s ease, color 0.4s ease`,
    pointerEvents: revealed ? "auto" : "none",
    display: "inline-block",
    fontFamily: "var(--font-montserrat), sans-serif",
    fontWeight: 300,
    fontSize: "13px",
    letterSpacing: "0.28em",
    color: "#e6d3ac",
    background: "transparent",
    border: "1px solid #c9a876",
    padding: "18px 44px",
    textAlign: "center",
  });

  return (
    <>
      <div
        id="top"
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
          src="/videos/dimesa-hero.mp4"
          poster="/images/dimesa-hero-poster.jpg"
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
            top: "24px",
            right: "24px",
            zIndex: 4,
            height: "42px",
            padding: "0 18px 0 14px",
            borderRadius: "21px",
            border: "1px solid rgba(201,168,118,0.4)",
            background: "rgba(11,10,9,0.55)",
            backdropFilter: "blur(4px)",
            display: introSkipped ? "none" : "flex",
            alignItems: "center",
            gap: "9px",
            cursor: "pointer",
            opacity: buttonVisible ? 1 : 0,
            transition: "opacity 1.1s ease, background-color 0.2s ease",
          }}
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e6d3ac" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M11 5 6 9H3v6h3l5 4V5z" />
              <line x1="16" y1="9" x2="22" y2="15" />
              <line x1="22" y1="9" x2="16" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e6d3ac" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M11 5 6 9H3v6h3l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 010 7" />
              <path d="M18.5 6a9 9 0 010 12" />
            </svg>
          )}
          <span
            style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 400,
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: "#e6d3ac",
              whiteSpace: "nowrap",
            }}
          >
            {muted ? "ACTIVAR SONIDO" : "SILENCIAR"}
          </span>
        </button>

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "#000",
            opacity: revealed ? 0.38 : 0.18,
            transition: "opacity 2.2s ease",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6vh 24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.9s ease, transform 0.9s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Image
                src="/images/dimesa-logo-full.png"
                alt="Dimesa · Scalp Therapy & Hair Care"
                width={1081}
                height={471}
                priority
                style={{ width: "clamp(240px, 30vw, 460px)", height: "auto" }}
              />
            </div>
            <div
              style={{
                marginTop: "14px",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 300,
                fontSize: "11px",
                letterSpacing: "0.32em",
                color: "#c9a876",
                textAlign: "center",
              }}
            >
              CUENCA &middot; ECUADOR
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: "48%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <Link href="/reservas" style={navItemStyle(0)} className="dimesa-nav-item">
              RESERVAS
            </Link>
            <Link href="/productos" style={navItemStyle(1)} className="dimesa-nav-item">
              PRODUCTOS
            </Link>
            <Link href="/profesionales" style={navItemStyle(2)} className="dimesa-nav-item">
              PROFESIONALES
            </Link>
            <Link href="/informacion" style={navItemStyle(3)} className="dimesa-nav-item">
              INFORMACIÓN
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .dimesa-nav-item:hover {
          background: #c9a876 !important;
          color: #0b0a09 !important;
        }
      `}</style>
    </>
  );
}
