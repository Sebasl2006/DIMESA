"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface VideoHeroProps {
  src: string;
  // Imagen que se ve de inmediato mientras el video carga/decodifica —
  // evita la pantalla negra en conexiones lentas. Opcional.
  poster?: string;
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
export function VideoHero({ src, poster, overlay, cornerLogo, children }: VideoHeroProps) {
  const [revealed, setRevealed] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  // Arranca silenciado (es lo único que garantiza el autoplay en todos los
  // navegadores de celular) y apenas el video ya está reproduciendo se
  // intenta activar el sonido solo — si el navegador de todos modos lo
  // bloquea, se queda callado y el botón permite reactivarlo a mano.
  const [muted, setMuted] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setOverlayVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // true mientras el <video> siga montado — al fallar/saltar la intro (ver
  // saltarIntro) se desmonta para que su cartel ("poster") no se quede
  // tapando el contenido ya revelado debajo.
  const [mostrarVideo, setMostrarVideo] = useState(true);

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // El video no arrancó o falló (autoplay bloqueado, conexión muy lenta,
  // error de carga): se quita el <video> y se revela el resto de la página
  // — mejor eso que dejar a la persona mirando una pantalla negra o
  // congelada varios segundos.
  const saltarIntro = () => {
    setMostrarVideo(false);
    reveal();
  };

  // Red de seguridad definitiva: un toque en la pantalla SIEMPRE cuenta
  // como interacción real del usuario, así que video.play() llamado aquí
  // adentro nunca lo bloquea ningún navegador (a diferencia del intento
  // automático de más abajo, que en algunos celulares — sobre todo con el
  // modo de bajo consumo activado — se queda trabado sin avisar). Si aun
  // así el video no arranca, igual se revela la página: mejor dejar pasar
  // a la persona que dejarla tocando la pantalla sin que pase nada.
  const handleTapHero = () => {
    if (revealed) return;
    const video = videoRef.current;
    if (video && video.paused) {
      video.muted = true;
      video.play()?.catch(() => {});
    }
    window.setTimeout(() => {
      if (!videoRef.current || videoRef.current.paused) saltarIntro();
    }, 400);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Redes de seguridad, de la más rápida a la más lenta:
    // - Si a los 8s el video todavía no arrancó nada (conexión muy lenta o
    //   un navegador que se queda esperando sin avisar), se salta la intro
    //   — mejor eso que dejar la pantalla negra/congelada mucho tiempo.
    // - Si por alguna razón sigue trabado a los 20s (bien por encima de lo
    //   que dura cualquiera de estos videos, ~10s, para no cortarlo a la
    //   mitad en el caso normal), también.
    // Además, cualquier toque en la pantalla (ver handleTapHero) lo
    // destraba al instante sin tener que esperar esto.
    const arranqueTimer = setTimeout(() => {
      if (video.currentTime === 0) saltarIntro();
    }, 8000);
    const maxWaitTimer = setTimeout(saltarIntro, 20000);

    // Arrancar en silencio es lo único que los navegadores de celular
    // garantizan sin necesitar interacción previa — intentar arrancar CON
    // sonido primero hacía que varios navegadores de celular directamente
    // no avanzaran el video en vez de solo rechazar la promesa, dejando la
    // pantalla congelada. Se queda silenciado (el botón permite activarlo a
    // mano) — probamos reactivarlo apenas arranca, pero en varios
    // navegadores eso mismo lo vuelve a pausar, así que no vale el riesgo.
    video.muted = true;

    // Intentar play() apenas se monta no siempre "prende" si el video
    // todavía no cargó nada — en vez de confiar en un solo intento, se
    // reintenta cada vez que el navegador avisa que ya tiene datos nuevos,
    // hasta que quede realmente reproduciendo.
    const intentarReproducir = () => {
      if (!video.paused) return;
      video.play()?.catch((err) => {
        // NotAllowedError: el navegador no deja arrancar el video solo —
        // reintentar no sirve de nada, se pasa directo a revelar la página.
        // Cualquier otro rechazo se reintenta con el próximo evento, o lo
        // cubren los temporizadores de arriba.
        if (err && err.name === "NotAllowedError") saltarIntro();
      });
    };
    intentarReproducir();
    video.addEventListener("loadeddata", intentarReproducir);
    video.addEventListener("canplay", intentarReproducir);
    video.addEventListener("canplaythrough", intentarReproducir);

    return () => {
      clearTimeout(arranqueTimer);
      clearTimeout(maxWaitTimer);
      video.removeEventListener("loadeddata", intentarReproducir);
      video.removeEventListener("canplay", intentarReproducir);
      video.removeEventListener("canplaythrough", intentarReproducir);
    };
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <>
      <div
        onClick={handleTapHero}
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          background: "#0b0a09",
        }}
      >
        {mostrarVideo && (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={reveal}
            onError={saltarIntro}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />
        )}

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
            display: mostrarVideo ? "flex" : "none",
            border: "1px solid rgba(201,168,118,0.4)",
            background: "rgba(11,10,9,0.55)",
            backdropFilter: "blur(4px)",
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
