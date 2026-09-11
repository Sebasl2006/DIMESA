import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Servicio } from "@/lib/types";
import { ImageSlot } from "@/components/ImageSlot";
import { Reveal } from "@/components/Reveal";
import { FondoLayer } from "@/components/FondoLayer";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "593983163000";

const CATEGORIA_INFO: Record<string, { number: string; label: string }> = {
  capilar: { number: "01", label: "Belleza y Salud Capilar" },
  facial: { number: "02", label: "Cuidado Facial" },
  corporal: { number: "03", label: "Tratamientos Corporales" },
  masajes: { number: "04", label: "Masajes" },
};

const fmt = (n: number) => "$" + n.toFixed(2);

function waHref(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontWeight: 400,
  fontSize: "11px",
  letterSpacing: "0.16em",
  color: "#c9a876",
};

export default async function ReservasPage({
  searchParams,
}: {
  // Llega desde el botón "Reservar con [nombre]" de la página de un
  // profesional (/profesionales/[id]) — ver ese archivo. Si viene, se le
  // agrega el nombre al mensaje de WhatsApp de cada servicio.
  searchParams: Promise<{ profesional?: string }>;
}) {
  const { profesional } = await searchParams;

  const supabase = await createClient();
  const { data: servicios } = await supabase
    .from("servicios")
    .select("*")
    .order("created_at", { ascending: true });

  const lista = (servicios ?? []) as Servicio[];

  const categorias = Object.entries(CATEGORIA_INFO)
    .map(([id, info]) => ({
      id,
      ...info,
      servicios: lista.filter((s) => s.categoria === id),
    }))
    .filter((cat) => cat.servicios.length > 0);

  let flatIndex = 0;

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

      <div
        style={{
          position: "sticky",
          top: "76px",
          zIndex: 40,
          background: "rgba(11,10,9,0.94)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(201,168,118,0.15)",
          display: "flex",
          justifyContent: "center",
          gap: "36px",
          padding: "18px 24px",
          flexWrap: "wrap",
        }}
      >
        <a href="#capilar" style={labelStyle}>BELLEZA Y SALUD CAPILAR</a>
        <a href="#facial" style={labelStyle}>CUIDADO FACIAL</a>
        <a href="#corporal" style={labelStyle}>TRATAMIENTOS CORPORALES</a>
        <a href="#masajes" style={labelStyle}>MASAJES</a>
      </div>

      <div style={{ textAlign: "center", padding: "90px 24px 20px" }}>
        <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.3em", color: "#6b5228", marginBottom: "14px" }}>
          SERVICIOS
        </div>
        <div className="font-serif" style={{ fontWeight: 300, fontSize: "clamp(2rem, 4.5vw, 3rem)", color: "#3d2f1a" }}>
          Nuestros tratamientos
        </div>
        {profesional && (
          <div
            style={{
              display: "inline-block",
              marginTop: "20px",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: "#6b5228",
              border: "1px solid rgba(107,82,40,0.35)",
              background: "rgba(201,168,118,0.12)",
              padding: "10px 22px",
              borderRadius: "20px",
            }}
          >
            Eligiendo servicio para reservar con {profesional} — escoge abajo el que quieras
          </div>
        )}
      </div>

      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "40px 24px 0" }}>
        {categorias.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "14px", color: "#5c5347" }}>
            Estamos preparando nuestro catálogo de servicios. Vuelve pronto.
          </div>
        ) : (
          categorias.map((cat) => (
            <div id={cat.id} key={cat.id} style={{ paddingTop: "70px" }}>
              <div style={{ textAlign: "center", marginBottom: "56px" }}>
                <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.3em", color: "#6b5228", marginBottom: "12px" }}>
                  {cat.number}
                </div>
                <div className="font-serif" style={{ fontWeight: 300, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#3d2f1a" }}>
                  {cat.label}
                </div>
              </div>

              {cat.servicios.map((sv) => {
                const reverse = flatIndex % 2 === 1;
                flatIndex++;
                return (
                  <div
                    key={sv.id}
                    style={{
                      display: "flex",
                      flexDirection: reverse ? "row-reverse" : "row",
                      gap: "56px",
                      alignItems: "center",
                      flexWrap: "wrap",
                      padding: "48px 0",
                      borderTop: "1px solid rgba(201,168,118,0.15)",
                    }}
                  >
                    <Reveal once={false} direction={reverse ? "right" : "left"} style={{ width: "45%", minWidth: "280px" }}>
                      <div style={{ width: "100%", height: "420px" }}>
                        <ImageSlot src={sv.imagen_url} alt={sv.nombre} placeholder={sv.nombre} />
                      </div>
                    </Reveal>
                    <Reveal
                      once={false}
                      delay={0.15}
                      style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "18px" }}
                    >
                      <div className="font-serif" style={{ fontWeight: 300, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#3d2f1a" }}>
                        {sv.nombre}
                      </div>
                      <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 300, fontSize: "14px", lineHeight: 1.8, color: "#5c5347", maxWidth: "440px" }}>
                        {sv.descripcion}
                      </div>
                      <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "14px", letterSpacing: "0.06em", color: "#6b5228" }}>
                        Desde {fmt(sv.precio_desde)}
                      </div>
                      <div>
                        <a
                          href={waHref(
                            profesional
                              ? `Hola, quiero reservar con ${profesional}: ${sv.nombre}`
                              : "Hola, quiero reservar: " + sv.nombre
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-block", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "12px", letterSpacing: "0.18em", color: "#0b0a09", background: "#c9a876", padding: "16px 32px" }}
                        >
                          RESERVAR POR WHATSAPP
                        </a>
                      </div>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div style={{ maxWidth: "820px", margin: "110px auto 0", padding: "70px 40px", textAlign: "center", background: "#141210", border: "1px solid rgba(201,168,118,0.22)", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.3em", color: "#8a7a5c", marginBottom: "16px" }}>
          DIMESA &middot; CUENCA, ECUADOR
        </div>
        <div className="font-serif" style={{ fontWeight: 300, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#e6d3ac", marginBottom: "20px" }}>
          Reserva tu visita ahora
        </div>
        <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 300, fontSize: "14px", color: "#8a8580", maxWidth: "440px", margin: "0 auto 32px", lineHeight: 1.7 }}>
          Escríbenos por WhatsApp y coordinamos tu cita con el especialista y horario ideal.
        </div>
        <a
          href={waHref("Hola, quiero agendar una cita en Dimesa")}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "13px", letterSpacing: "0.2em", color: "#0b0a09", background: "#c9a876", padding: "20px 48px" }}
        >
          RESERVAR POR WHATSAPP
        </a>
      </div>

      <div style={{ textAlign: "center", padding: "60px 24px 80px" }}>
        <Link href="/#top" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#6b5228" }}>
          &larr; VOLVER AL INICIO
        </Link>
      </div>
      </div>
    </div>
  );
}
