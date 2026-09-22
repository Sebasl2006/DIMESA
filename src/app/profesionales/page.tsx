import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profesional } from "@/lib/types";
import { ImageSlot } from "@/components/ImageSlot";
import { FondoLayer } from "@/components/FondoLayer";

export default async function ProfesionalesPage() {
  const supabase = await createClient();
  const { data: profesionales } = await supabase
    .from("profesionales")
    .select("*")
    .eq("disponible", true)
    .order("created_at", { ascending: true });

  const equipo = (profesionales ?? []) as Profesional[];

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

      <div style={{ textAlign: "center", padding: "130px 24px 20px" }}>
        <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.3em", color: "#6b5228", marginBottom: "14px" }}>
          NUESTRO EQUIPO
        </div>
        <div className="font-serif" style={{ fontWeight: 300, fontSize: "clamp(2.6rem, 6vw, 4rem)", color: "#3d2f1a" }}>
          Profesionales
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "100px 24px 40px" }}>
        {equipo.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "14px", color: "#5c5347" }}>
            Estamos presentando a nuestro equipo. Vuelve pronto.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: "64px 90px" }}>
            {equipo.map((p) => {
              return (
                <div key={p.id} className="profesional-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <div
                    className="profesional-foto"
                    style={{
                      width: "350px",
                      height: "350px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "1px solid rgba(201,168,118,0.4)",
                      padding: "6px",
                      boxSizing: "border-box",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", position: "relative" }}>
                      <ImageSlot src={p.foto_url} alt={p.nombre} placeholder={p.nombre} sizes="350px" eager />
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div className="font-serif" style={{ fontWeight: 400, fontSize: "19px", color: "#1c1710" }}>
                      {p.nombre}
                    </div>
                    <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.12em", color: "#4a3818", marginTop: "4px" }}>
                      {p.especialidad.toUpperCase()}
                    </div>
                  </div>

                  <Link
                    href={`/profesionales/${p.id}`}
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontWeight: 400,
                      fontSize: "11px",
                      letterSpacing: "0.16em",
                      color: "#6b5228",
                      border: "1px solid #6b5228",
                      padding: "12px 28px",
                      textAlign: "center",
                    }}
                    className="profesional-ver-info"
                  >
                    VER INFORMACIÓN
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "60px 24px 90px" }}>
        <Link href="/#top" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#6b5228" }}>
          &larr; VOLVER AL INICIO
        </Link>
      </div>
      </div>
    </div>
  );
}
