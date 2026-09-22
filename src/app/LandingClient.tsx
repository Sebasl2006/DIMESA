"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

// Solo se reproduce el video de entrada en computadora, laptop o tablet, y
// una vez por cada carga de la página — en celular NUNCA se reproduce (ver
// esCelular más abajo), se entra directo al logo y los botones.
//
// Esta variable vive en memoria mientras la pestaña no se recargue: si la
// persona navega a otra sección (Reservas, Productos...) y vuelve al inicio
// SIN recargar, se salta directo; pero recargar (F5), abrir el sitio en una
// pestaña nueva o escribir la dirección otra vez sí vuelve a mostrar el
// video. Antes se guardaba una marca en sessionStorage apenas arrancaba, y
// esa marca sobrevivía a las recargas: quien probaba un cambio recargando
// la página veía que "el video ya no se reproducía" aunque estuviera bien.
let introMostradaEnEstaCarga = false;

// Mismo punto de corte que la regla @media de aquí abajo (dimesa-hero-bg-*)
// — tiene que ser el mismo número en los dos lados, o JS y CSS podrían no
// ponerse de acuerdo sobre qué mostrar.
const MOBILE_BREAKPOINT = "(max-width: 767px)";

// Foto fija de fondo — el mismo cuadro final que se ve al terminar el
// video en computadora, o el que se ve directo en celular (nunca hay
// video ahí). Las dos SIEMPRE están en el HTML desde el primerísimo
// pintado (ver el <style jsx global> de abajo, que decide con CSS puro
// cuál mostrar según el ancho de pantalla) — antes esta decisión se
// tomaba en JavaScript después de montar React, y en una conexión lenta
// de celular se alcanzaba a ver un instante de fondo negro (o el video
// equivocado) mientras tanto.
const FONDO_FINAL_DESKTOP = "/images/dimesa-hero-final-poster.jpg";
const FONDO_FINAL_MOBILE = "/images/dimesa-hero-vertical-poster-v2.jpg";

export function LandingClient() {
  const [revealed, setRevealed] = useState(false);
  // Solo se pone en true para computadora/laptop/tablet en su primera
  // visita de la sesión (ver el useLayoutEffect de abajo) — arranca en
  // false tanto en el servidor como en el primer render del cliente, así
  // que el <video> nunca llega a existir en el HTML para nadie en celular,
  // ni siquiera por una fracción de segundo.
  const [mostrarVideo, setMostrarVideo] = useState(false);
  // Arranca silenciado (es lo único que garantiza el autoplay en todos los
  // navegadores) y apenas el video ya está reproduciendo se intenta
  // activar el sonido solo — si el navegador de todos modos lo bloquea, se
  // queda callado y el botón permite reactivarlo a mano.
  const [muted, setMuted] = useState(true);
  // El botón de sonido debe verse desde el arranque del video (no solo
  // después de que termine y se revele el resto), así que usa su propio
  // fade-in temprano en vez de depender de "revealed".
  const [buttonVisible, setButtonVisible] = useState(false);
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
  };

  // El video no arrancó o falló (autoplay bloqueado por el navegador,
  // conexión muy lenta, error de carga): se quita el <video> y se muestra
  // el menú sobre la foto final — mejor eso que dejar a la persona mirando
  // un primer cuadro congelado. Quitar el <video> es importante: si se
  // quedara montado, su imagen "poster" taparía la foto de fondo.
  const saltarIntro = () => {
    setMostrarVideo(false);
    setRevealed(true);
  };

  // Red de seguridad definitiva: un toque en la pantalla SIEMPRE cuenta
  // como interacción real del usuario, así que video.play() llamado aquí
  // adentro nunca lo bloquea ningún navegador (a diferencia del intento
  // automático de más abajo, que en algunas computadoras — sobre todo con
  // el modo de bajo consumo activado — se queda trabado sin avisar). Si
  // aun así el video no arranca, igual se revela el menú: mejor dejar
  // pasar a la persona que dejarla tocando la pantalla sin que pase nada.
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
    const timer = setTimeout(() => setButtonVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // useLayoutEffect (no useEffect): la decisión de mostrar el video tiene
  // que quedar tomada ANTES de que el navegador pinte el primer cuadro, o
  // se notaría un parpadeo cuando cambia justo después del primer pintado.
  useLayoutEffect(() => {
    if (efectoIntroYaCorrioRef.current) return;
    efectoIntroYaCorrioRef.current = true;

    const esCelular = window.matchMedia(MOBILE_BREAKPOINT).matches;

    if (esCelular) {
      // En celular nunca se muestra el video — directo al menú, sobre la
      // foto fija (que ya está de fondo desde el primer pintado por CSS).
      setRevealed(true);
      return;
    }

    if (introMostradaEnEstaCarga) {
      setRevealed(true);
      return;
    }

    // Se marca como "vista" apenas arranca (no solo cuando termina) — si
    // la persona se va a otra sección antes de que acabe el video y luego
    // vuelve al inicio, ya no debe repetirse desde cero.
    introMostradaEnEstaCarga = true;

    setMostrarVideo(true);
  }, []);

  useEffect(() => {
    if (!mostrarVideo) return;
    const video = videoRef.current;
    if (!video) return;

    // Redes de seguridad, de la más rápida a la más lenta:
    // - Si a los 8s el video todavía no arrancó nada (conexión muy lenta o
    //   un navegador que se queda esperando sin avisar), se salta la intro.
    // - Si por alguna razón sigue trabado a los 20s (bien por encima de lo
    //   que dura el video, ~10s, para no cortarlo a la mitad en el caso
    //   normal), también.
    // Además, cualquier toque en la pantalla (ver handleTapHero) lo
    // destraba al instante sin tener que esperar esto.
    const arranqueTimer = setTimeout(() => {
      if (video.currentTime === 0) saltarIntro();
    }, 8000);
    const maxWaitTimer = setTimeout(saltarIntro, 20000);

    // Arrancar en silencio es lo único que los navegadores garantizan sin
    // necesitar que la persona ya haya interactuado con la página. Se
    // queda silenciado (el botón de arriba permite activarlo a mano) —
    // probamos reactivarlo apenas arranca, pero en varios navegadores eso
    // mismo lo vuelve a pausar, así que no vale el riesgo.
    video.muted = true;

    // Intentar play() apenas se monta no siempre "prende" si el video
    // todavía no cargó nada — en vez de confiar en un solo intento, se
    // reintenta cada vez que el navegador avisa que ya tiene datos nuevos,
    // hasta que quede realmente reproduciendo.
    const intentarReproducir = () => {
      if (!video.paused) return;
      video.play()?.catch((err) => {
        // NotAllowedError: el navegador (o el modo de ahorro de energía) no
        // deja arrancar el video solo — reintentar no sirve de nada, así que
        // se pasa directo al menú en vez de dejar la pantalla congelada.
        // Cualquier otro rechazo (ej. todavía cargando) se reintenta con el
        // próximo evento, o lo cubren los temporizadores de arriba.
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
  }, [mostrarVideo]);

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
        onClick={handleTapHero}
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          background: "#0b0a09",
        }}
      >
        {/* Las dos siempre están en el HTML — la clase decide con CSS puro
            (ver <style jsx global> abajo) cuál se ve según el ancho de
            pantalla, sin depender de que React termine de hidratarse. */}
        <Image
          src={FONDO_FINAL_MOBILE}
          alt=""
          fill
          priority
          // La capa que queda oculta por CSS declara 1px: así el navegador
          // baja solo la versión diminuta de esa foto en vez de la completa.
          sizes="(min-width: 768px) 1px, 100vw"
          className="dimesa-hero-bg dimesa-hero-bg-mobile"
          style={{ objectFit: "cover", zIndex: 0 }}
        />
        <Image
          src={FONDO_FINAL_DESKTOP}
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 1px, 100vw"
          className="dimesa-hero-bg dimesa-hero-bg-desktop"
          style={{ objectFit: "cover", zIndex: 0 }}
        />

        {mostrarVideo && (
          <video
            ref={videoRef}
            src="/videos/dimesa-hero.mp4"
            poster="/images/dimesa-hero-poster.jpg"
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
            top: "24px",
            right: "24px",
            zIndex: 4,
            height: "42px",
            padding: "0 18px 0 14px",
            borderRadius: "21px",
            border: "1px solid rgba(201,168,118,0.4)",
            background: "rgba(11,10,9,0.55)",
            backdropFilter: "blur(4px)",
            display: mostrarVideo ? "flex" : "none",
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
          className="dimesa-hero-content"
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingLeft: "24px",
            paddingRight: "24px",
            paddingBottom: "6vh",
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

          {/* flex:1 + centrado interno (en vez de position:absolute con un
              "top" fijo en %) — así los botones siempre quedan centrados en
              el espacio que sobra DEBAJO del logo, sin importar cuánto mida
              ese logo. Con el "top" fijo, en pantallas más bajas que anchas
              (laptops normales) el logo ocupaba más alto relativo y los
              botones — pegados a un % fijo del alto total — quedaban
              montados encima del subtítulo "CUENCA · ECUADOR". */}
          <div
            className="dimesa-hero-nav"
            style={{
              flex: 1,
              width: "100%",
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
        .dimesa-hero-bg-mobile {
          display: block;
        }
        .dimesa-hero-bg-desktop {
          display: none;
        }
        .dimesa-hero-content {
          padding-top: 22vh;
        }
        .dimesa-hero-nav {
          justify-content: flex-start;
          padding-top: 36px;
        }
        @media (min-width: 768px) {
          .dimesa-hero-bg-mobile {
            display: none;
          }
          .dimesa-hero-bg-desktop {
            display: block;
          }
          .dimesa-hero-content {
            padding-top: 6vh;
          }
          .dimesa-hero-nav {
            justify-content: center;
            padding-top: 0;
          }
        }
      `}</style>
    </>
  );
}
