import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Informacion } from "@/lib/types";
import { ImageSlot } from "@/components/ImageSlot";
import { Reveal } from "@/components/Reveal";
import { FondoLayer } from "@/components/FondoLayer";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "593983163000";

function waHref(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// TODO: reemplaza estas cifras por las reales cuando las tengas — son
// las únicas que no vienen de la base de datos (el rating de Google sí
// es el real que diste). Fácil de editar: son solo estos 4 objetos.
const CIFRAS = [
  { valor: "5.0 ★", label: "Calificación en Google (8 reseñas)" },
  { valor: "+5", label: "Años de trayectoria" }, // TODO: número real de años
  { valor: "+500", label: "Clientas atendidas" }, // TODO: número real de clientas
  { valor: "100%", label: "Productos profesionales" },
];

const PROCESO = [
  { n: "01", titulo: "Diagnóstico capilar personalizado", desc: "Escuchamos tu cabello y tu historia antes de recomendar nada — cada tratamiento parte de un diagnóstico real." },
  { n: "02", titulo: "Recomendación de tratamiento", desc: "Diseñamos un plan a tu medida, desde colorimetría hasta nuestra Porcelanización Dimesa." },
  { n: "03", titulo: "Aplicación con productos de alta gama", desc: "Trabajamos solo con marcas profesionales — Botaniqué, Revlon, M|Q Professional y TRUSS." },
  { n: "04", titulo: "Seguimiento y cuidado en casa", desc: "Te acompañamos después de la cita con recomendaciones para mantener el resultado." },
];

const labelStyle = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontWeight: 400,
  fontSize: "11px",
  letterSpacing: "0.3em",
  color: "#8a7a5c",
} as const;

const serifTitle = {
  fontFamily: "var(--font-cormorant), serif",
  fontWeight: 300,
  color: "#e6d3ac",
} as const;

const bodyText = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontWeight: 300,
  color: "#8a8580",
} as const;

export default async function InformacionPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("informacion").select("*").eq("id", 1).single();
  const info = data as Informacion | null;

  const titulo = info?.titulo || "Vive la Experiencia Dimesa";
  const descripcion =
    info?.descripcion ||
    "En Dimesa vivimos la belleza como una experiencia. Somos especialistas en salud capilar y colorimetría, dedicados a transformar el cabello de nuestras clientas.";
  const direccion = info?.direccion;
  const horario = info?.horario;
  const telefono = info?.telefono;

  return (
    <div style={{ background: "#0b0a09", minHeight: "100vh" }}>
      <FondoLayer />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "76px",
            background: "rgba(11,10,9,0.94)",
            backdropFilter: "blur(6px)",
            borderBottom: "1px solid rgba(201,168,118,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            zIndex: 50,
            boxSizing: "border-box",
          }}
        >
          <Link href="/#top" style={{ display: "flex", alignItems: "center" }}>
            <Image src="/images/dimesa-logo.png" alt="Dimesa" width={1076} height={361} priority style={{ height: "34px", width: "auto" }} />
          </Link>
        </div>

        {/* 1 — Hero */}
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center", padding: "150px 24px 40px" }}>
          <Reveal>
            <div style={{ ...labelStyle, color: "#000000" }}>03 &mdash; INFORMACIÓN</div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ ...serifTitle, color: "#000000", fontSize: "clamp(2.2rem, 5vw, 3.6rem)", margin: "18px 0 26px" }}>{titulo}</div>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ ...bodyText, color: "#000000", fontSize: "15px", lineHeight: 1.9, maxWidth: "540px", margin: "0 auto" }}>{descripcion}</div>
          </Reveal>
        </div>

        {/* 2 — Cifras */}
        <Reveal>
          <div
            style={{
              maxWidth: "1080px",
              margin: "70px auto 0",
              padding: "56px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "40px",
              borderTop: "1px solid rgba(201,168,118,0.15)",
              borderBottom: "1px solid rgba(201,168,118,0.15)",
            }}
          >
            {CIFRAS.map((c) => (
              <div key={c.label} style={{ textAlign: "center" }}>
                <div style={{ ...serifTitle, fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "#000000" }}>{c.valor}</div>
                <div style={{ ...bodyText, color: "#000000", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "10px", lineHeight: 1.5 }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* 3 — Quiénes somos */}
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "110px 24px 0" }}>
          <div style={{ display: "flex", gap: "64px", alignItems: "center", flexWrap: "wrap" }}>
            <Reveal style={{ flex: 1, minWidth: "300px" }}>
              <div style={{ ...labelStyle, color: "#000000" }}>QUIÉNES SOMOS</div>
              <div style={{ ...serifTitle, color: "#000000", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", margin: "16px 0 24px" }}>
                Belleza como experiencia
              </div>
              <div style={{ ...bodyText, color: "#000000", fontSize: "14px", lineHeight: 1.9, maxWidth: "460px" }}>
                {descripcion} Cada visita a Dimesa está pensada como un momento propio: un espacio en Cuenca donde la
                técnica profesional y el cuidado personal se encuentran, para que salgas viendo — y sintiendo — tu
                mejor versión.
              </div>
            </Reveal>
            <Reveal delay={0.15} style={{ flex: 1, minWidth: "300px" }}>
              <div style={{ width: "100%", aspectRatio: "4 / 5" }}>
                <ImageSlot src={info?.foto_url} alt="Salón Dimesa" placeholder="Fotografía del salón Dimesa" />
              </div>
            </Reveal>
          </div>
        </div>

        {/* 4 — Cómo vivirás la experiencia */}
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "130px 24px 0" }}>
          <Reveal style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ ...labelStyle, color: "#000000" }}>LA EXPERIENCIA</div>
            <div style={{ ...serifTitle, color: "#000000", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", margin: "16px 0" }}>
              Cómo vivirás la experiencia
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "40px" }}>
            {PROCESO.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.1}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "1px solid rgba(201,168,118,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...serifTitle,
                    fontSize: "16px",
                    color: "#000000",
                    marginBottom: "22px",
                  }}
                >
                  {p.n}
                </div>
                <div style={{ ...serifTitle, color: "#000000", fontSize: "19px", marginBottom: "12px" }}>{p.titulo}</div>
                <div style={{ ...bodyText, color: "#000000", fontSize: "13px", lineHeight: 1.75 }}>{p.desc}</div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* 5 — Contacto */}
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "130px 24px 0" }}>
          <Reveal style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ ...labelStyle, color: "#000000" }}>VISÍTANOS</div>
            <div style={{ ...serifTitle, color: "#000000", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", margin: "16px 0" }}>
              Encuéntranos
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            {[
              {
                label: "UBICACIÓN",
                valor: direccion,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a876" strokeWidth={1.4}>
                    <path d="M12 21s-7-6.5-7-11.5A7 7 0 0119 9.5C19 14.5 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.4" />
                  </svg>
                ),
                href: undefined as string | undefined,
              },
              {
                label: "HORARIO",
                valor: horario,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a876" strokeWidth={1.4}>
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7.5V12l3 2" />
                  </svg>
                ),
                href: undefined as string | undefined,
              },
              {
                label: "TELÉFONO / WHATSAPP",
                valor: telefono,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a876" strokeWidth={1.4}>
                    <path d="M4 5.5C4 4.7 4.7 4 5.5 4H8l2 4.5-1.8 1.8a12 12 0 006.5 6.5l1.8-1.8L20 16.5v2.5c0 .8-.7 1.5-1.5 1.5C10.4 20.5 4 14.1 4 6.5v-1z" />
                  </svg>
                ),
                href: telefono ? waHref("Hola, quiero más información sobre Dimesa") : undefined,
              },
            ].map((card) => {
              const cardStyle = {
                border: "1px solid rgba(201,168,118,0.22)",
                background: "#141210",
                padding: "36px 28px",
                display: "flex",
                flexDirection: "column" as const,
                gap: "16px",
              };
              const content = (
                <>
                  {card.icon}
                  <div>
                    <div style={{ ...labelStyle, fontSize: "10px", marginBottom: "8px" }}>{card.label}</div>
                    <div style={{ ...bodyText, fontSize: "14px", color: "#e6d3ac", lineHeight: 1.6 }}>
                      {card.valor || "—"}
                    </div>
                  </div>
                </>
              );
              return (
                <Reveal key={card.label}>
                  {card.href ? (
                    <a href={card.href} target="_blank" rel="noopener noreferrer" style={cardStyle}>
                      {content}
                    </a>
                  ) : (
                    <div style={cardStyle}>{content}</div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* 6 — Testimonios */}
        {/* TODO: agregar sección de testimonios reales cuando tengamos reseñas
            para mostrar (no existe todavía un componente ni datos de esto). */}

        {/* 7 — CTA final */}
        <Reveal>
          <div style={{ maxWidth: "820px", margin: "130px auto 0", padding: "70px 40px", textAlign: "center", background: "#141210", border: "1px solid rgba(201,168,118,0.22)", boxSizing: "border-box" }}>
            <div style={{ ...serifTitle, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", marginBottom: "20px" }}>
              ¿Lista para vivir la experiencia Dimesa?
            </div>
            <div style={{ ...bodyText, fontSize: "14px", maxWidth: "440px", margin: "0 auto 32px", lineHeight: 1.7 }}>
              Reserva tu cita y déjanos cuidar de ti.
            </div>
            <Link
              href="/reservas"
              style={{ display: "inline-block", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "13px", letterSpacing: "0.2em", color: "#0b0a09", background: "#c9a876", padding: "20px 48px" }}
            >
              RESERVAR AHORA
            </Link>
          </div>
        </Reveal>

        <div style={{ textAlign: "center", padding: "60px 24px 90px" }}>
          <Link href="/#top" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#000000" }}>
            &larr; VOLVER AL INICIO
          </Link>
        </div>
      </div>
    </div>
  );
}
