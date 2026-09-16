"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

// Solo se reproduce el video de entrada la primera vez que alguien llega a
// esta pestaña. Si ya lo vio y navega a otra sección (Reservas, Productos...)
// y vuelve al inicio, se salta directo al logo + botones — sessionStorage se
// borra al cerrar la pestaña, así que en una visita nueva sí se reproduce.
const INTRO_KEY = "dimesa-intro-vista";

// En celulares en vertical, el video horizontal (16:9) recorta a la chica del
// video y solo se le ven los brazos. Por debajo de este ancho se sirve una
// versión recortada en vertical (9:16) que sí la mantiene en cuadro.
const MOBILE_BREAKPOINT = "(max-width: 767px)";

// Cuando ya se vio la intro esta sesión, en vez de mostrar el <video> (que
// hay que volver a decodificar/buscar cada vez que se regresa al inicio —
// en celular eso tarda varios segundos y de pantalla en negro mientras
// tanto) se muestra esta foto fija del último cuadro. Es la misma imagen
// que ya usábamos como "poster" del video vertical en celular.
const FONDO_FINAL_DESKTOP = "/images/dimesa-hero-final-poster.jpg";
const FONDO_FINAL_MOBILE = "/images/dimesa-hero-vertical-poster.jpg";

export function LandingClient() {
  const [revealed, setRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Arranca silenciado (es lo único que garantiza el autoplay en todos los
  // navegadores de celular) y apenas el video ya está reproduciendo se
  // intenta activar el sonido solo — si el navegador de todos modos lo
  // bloquea, se queda callado y el botón permite reactivarlo a mano.
  const [muted, setMuted] = useState(true);
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

  // useLayoutEffect (no useEffect): debe fijar isMobile ANTES de que el
  // siguiente efecto (el que arranca el autoplay) lea el <video> — si no,
  // en celular arrancaría reproduciendo el video horizontal por un
  // instante y luego se reiniciaría al cambiar de fuente.
  useLayoutEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // useLayoutEffect (no useEffect): si ya se vio la intro, "introSkipped"
  // tiene que quedar en true ANTES de que el navegador pinte el primer
  // cuadro — si no, alcanzaría a dibujar el <video> (con su poster de
  // arranque, que es la entrada vacía) durante un instante antes de
  // cambiar a la foto fija de cierre, y se notaría el parpadeo.
  useLayoutEffect(() => {
    if (efectoIntroYaCorrioRef.current) return;
    efectoIntroYaCorrioRef.current = true;

    let yaVista = false;
    try {
      yaVista = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {
      // Sin acceso a sessionStorage — se trata como primera vez.
    }

    if (yaVista) {
      setIntroSkipped(true);
      setRevealed(true);
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
  }, []);

  // Efecto separado del de arriba (y con isMobile en las dependencias) a
  // propósito: "isMobile" arranca en false y recién se corrige un instante
  // después (ver el useLayoutEffect de arriba), lo cual cambia el "src"
  // del <video> de la versión horizontal a la vertical — ese cambio de
  // fuente interrumpe con un AbortError cualquier reproducción ya en
  // marcha. Si este efecto corriera una sola vez, ese primer intento
  // fallido quedaba como el único intento y el video se congelaba para
  // siempre. Al depender de "isMobile", el efecto se vuelve a ejecutar
  // apenas se corrige, y reintenta sobre el <video> ya con la fuente
  // correcta y definitiva.
  useEffect(() => {
    if (introSkipped) return;
    const video = videoRef.current;
    if (!video) return;

    // Red de seguridad: si el video se traba (pasa sobre todo en celular,
    // con conexiones lentas o navegadores que ni siquiera avisan el error)
    // esto igual revela el menú pasado un tiempo prudente, en vez de dejar
    // a la persona con la pantalla congelada y sin ninguna opción.
    const maxWaitTimer = setTimeout(reveal, 15000);

    // Arrancar en silencio es lo único que los navegadores de celular
    // garantizan sin necesitar que la persona ya haya interactuado con la
    // página — intentar arrancar CON sonido primero (como se hacía antes)
    // hace que varios navegadores de celular directamente no avancen el
    // video en vez de solo rechazar la promesa, dejando la pantalla
    // congelada y sin que aparezca el menú. Se queda silenciado (el botón
    // de arriba permite activarlo a mano) — probamos reactivarlo apenas
    // arranca, pero en varios navegadores eso mismo lo vuelve a pausar,
    // así que no vale el riesgo.
    video.muted = true;

    // Intentar play() apenas se monta no siempre "prende" si el video
    // todavía no cargó nada — en vez de confiar en un solo intento, se
    // reintenta cada vez que el navegador avisa que ya tiene datos nuevos,
    // hasta que quede realmente reproduciendo.
    const intentarReproducir = () => {
      if (!video.paused) return;
      video.play()?.catch(() => {
        // No arrancó todavía — se reintenta con el próximo evento, o
        // como último recurso, revela el menú el temporizador de arriba.
      });
    };
    intentarReproducir();
    video.addEventListener("loadeddata", intentarReproducir);
    video.addEventListener("canplay", intentarReproducir);
    video.addEventListener("canplaythrough", intentarReproducir);

    return () => {
      clearTimeout(maxWaitTimer);
      video.removeEventListener("loadeddata", intentarReproducir);
      video.removeEventListener("canplay", intentarReproducir);
      video.removeEventListener("canplaythrough", intentarReproducir);
    };
  }, [isMobile, introSkipped]);

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
        {introSkipped ? (
          // Ya se vio la intro esta sesión: se muestra la foto fija del
          // cierre en vez del <video> — evita tener que rebuscar/decodificar
          // el video de nuevo cada vez que se vuelve al inicio (lento en
          // celular, se notaba como una pantalla en negro de varios segundos).
          <Image
            src={isMobile ? FONDO_FINAL_MOBILE : FONDO_FINAL_DESKTOP}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", zIndex: 0 }}
          />
        ) : (
          <video
            ref={videoRef}
            src={isMobile ? "/videos/dimesa-hero-vertical.mp4" : "/videos/dimesa-hero.mp4"}
            poster={isMobile ? "/images/dimesa-hero-vertical-poster.jpg" : "/images/dimesa-hero-poster.jpg"}
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

          {/* flex:1 + centrado interno (en vez de position:absolute con un
              "top" fijo en %) — así los botones siempre quedan centrados en
              el espacio que sobra DEBAJO del logo, sin importar cuánto mida
              ese logo. Con el "top" fijo, en pantallas más bajas que anchas
              (laptops normales) el logo ocupaba más alto relativo y los
              botones — pegados a un % fijo del alto total — quedaban
              montados encima del subtítulo "CUENCA · ECUADOR". */}
          <div
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
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
