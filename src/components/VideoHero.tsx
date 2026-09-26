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
  // El video solo se ve cuando YA está reproduciendo de verdad (evento
  // "playing"). Mientras tanto se ve la imagen de portada, puesta como <img>
  // debajo: en varios celulares/tablets el <video> pinta negro (y esconde su
  // propio "poster") hasta que decodifica el primer cuadro — o para siempre
  // si la conexión se atasca. Así nunca se ve una pantalla negra.
  const [reproduciendo, setReproduciendo] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setOverlayVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      const promesa = video.play();
      // Se revela solo si el navegador de verdad rechaza el play() — antes
      // se revisaba "video.paused" a los 400ms, y como play() tarda un
      // momento en resolver, un toque que SÍ arrancaba el video igual lo
      // cortaba y revelaba la página.
      promesa?.catch(() => reveal());
      return;
    }
    if (!video) reveal();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Red de seguridad: si el video se traba de verdad (conexión lenta,
    // modo de bajo consumo, o un navegador que ni siquiera avisa el error)
    // esto igual revela el resto de la página pasado un tiempo bien por
    // encima de lo que dura cualquiera de estos videos (~10s) — para no
    // cortar el video a la mitad en el caso normal, que es la inmensa
    // mayoría de las veces. Además, cualquier toque en la pantalla (ver
    // handleTapHero) lo destraba al instante sin tener que esperar esto.
    const maxWaitTimer = setTimeout(reveal, 20000);
    // Si a los 4s todavía no avanzó ni un cuadro, se reinicia la carga una
    // vez (arregla el atasco típico de un primer intento que nunca arranca);
    // si a los 9s sigue igual, se muestra la página sobre la imagen de
    // portada en vez de dejar a la persona esperando.
    const reintentoTimer = setTimeout(() => {
      if (video.currentTime === 0) {
        video.load();
        video.play()?.catch(() => {});
      }
    }, 4000);
    const sinArranqueTimer = setTimeout(() => {
      if (video.currentTime === 0) reveal();
    }, 9000);

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
    // hasta que quede realmente reproduciendo. "loadeddata", "canplay" y
    // "canplaythrough" pueden dispararse casi al mismo tiempo (el archivo
    // ya venía bastante bufferizado) — sin la bandera "intentando", cada
    // uno llamaba a play() de nuevo mientras el anterior todavía no
    // terminaba de resolver, y esos play() superpuestos son justo lo que
    // hacía que el video se quedara pegado en el primer cuadro un rato
    // antes de arrancar de verdad.
    let intentando = false;
    const intentarReproducir = () => {
      if (!video.paused || intentando) return;
      intentando = true;
      const promesa = video.play();
      if (promesa && typeof promesa.finally === "function") {
        promesa
          .catch((err) => {
            // NotAllowedError: el navegador no deja arrancar el video solo
            // (modo de bajo consumo, por ejemplo) — reintentar no sirve, así
            // que se muestra la página sobre la portada. Cualquier otro
            // rechazo se reintenta con el próximo evento.
            if (err && err.name === "NotAllowedError") reveal();
          })
          .finally(() => {
            intentando = false;
          });
      } else {
        intentando = false;
      }
    };
    intentarReproducir();
    video.addEventListener("loadeddata", intentarReproducir);
    video.addEventListener("canplay", intentarReproducir);
    video.addEventListener("canplaythrough", intentarReproducir);
    const alReproducir = () => setReproduciendo(true);
    video.addEventListener("playing", alReproducir);
    if (!video.paused && video.currentTime > 0) setReproduciendo(true);

    return () => {
      clearTimeout(maxWaitTimer);
      clearTimeout(reintentoTimer);
      clearTimeout(sinArranqueTimer);
      video.removeEventListener("playing", alReproducir);
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
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            fetchPriority="high"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          />
        )}
        <video
          ref={videoRef}
          src={src}
          // Sin "autoPlay": React no escribe el atributo "muted" en el HTML
          // del servidor, y un autoplay sin silenciar lo bloquean los
          // navegadores antes de que el código pueda silenciarlo. El efecto
          // de arriba silencia primero y luego llama a play().
          muted
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
            opacity: reproduciendo ? 1 : 0,
            transition: "opacity .25s ease",
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
