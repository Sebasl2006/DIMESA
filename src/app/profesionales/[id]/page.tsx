import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import type { Profesional } from "@/lib/types";
import { ImageSlot } from "@/components/ImageSlot";
import { FondoLayer } from "@/components/FondoLayer";
import { partirBio } from "@/lib/bio";

// Si el admin no escribió una bio a mano, se arma una razonable a partir
// del nombre + especialidad + credenciales — así la página nunca sale
// vacía, ni para profesionales agregados antes de que existiera este campo.
function bioAutomatica(p: Profesional): string {
  const credenciales = p.descripcion
    .split("\n")
    .map((l) => l.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
  const primerNombre = p.nombre.split(" ")[0];
  const intro = `Hola, soy ${primerNombre}, especialista en ${p.especialidad.toLowerCase()} en Dimesa.`;
  if (credenciales.length === 0) return intro;
  return `${intro} ${credenciales.join(", ")}.`;
}

// Se genera una vez y se guarda; se vuelve a generar sola a lo más cada 60 s, y
// al instante cuando se guarda un cambio desde el admin (revalidatePath).
export const revalidate = 60;

export async function generateStaticParams() {
  const { data } = await createPublicClient().from("profesionales").select("id").eq("disponible", true);
  return (data ?? []).map((p) => ({ id: p.id as string }));
}

export default async function ProfesionalDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase.from("profesionales").select("*").eq("id", id).single();

  if (!data) notFound();
  const p = data as Profesional;
  const bio = p.bio?.trim() || bioAutomatica(p);

  // La primera parte sale como texto normal en negro, la segunda (si el
  // admin escribió una) como una "viñeta" tipo globo de diálogo pegada a
  // la foto — ver src/lib/bio.ts para cómo se guardan juntas las dos.
  const { texto: textoCredenciales, frase: fraseDestacadaTexto } = partirBio(bio);
  const fraseDestacada = fraseDestacadaTexto || null;

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

        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "150px 24px 100px", textAlign: "center" }}>
          <div style={{ position: "relative", width: "clamp(280px, 45vw, 420px)", margin: fraseDestacada ? "130px auto 0" : "0 auto" }}>
            {fraseDestacada && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  marginBottom: "22px",
                  width: "92%",
                  background: "#f3ead9",
                  border: "1px solid rgba(107,82,40,0.3)",
                  borderRadius: "18px",
                  padding: "18px 20px",
                  boxShadow: "0 8px 24px rgba(30,20,5,0.18)",
                  textAlign: "left",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="font-serif"
                  style={{
                    fontWeight: 700,
                    fontSize: "clamp(14px, 1.8vw, 17px)",
                    lineHeight: 1.5,
                    color: "#000000",
                  }}
                >
                  &ldquo;{fraseDestacada}&rdquo;
                </div>
                {/* Colita del globo, apuntando hacia abajo, hacia la foto */}
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "38%",
                    width: 0,
                    height: 0,
                    borderLeft: "9px solid transparent",
                    borderRight: "9px solid transparent",
                    borderTop: "10px solid #f3ead9",
                  }}
                />
              </div>
            )}

            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid rgba(201,168,118,0.4)",
                padding: "6px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", position: "relative" }}>
                <ImageSlot src={p.foto_url} alt={p.nombre} placeholder={p.nombre} sizes="420px" eager />
              </div>
            </div>
          </div>

          <div className="font-serif" style={{ fontWeight: 400, fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", color: "#000000", marginTop: "32px" }}>
            {p.nombre}
          </div>
          <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.16em", color: "#4a3818", marginTop: "8px" }}>
            {p.especialidad.toUpperCase()}
          </div>

          {textoCredenciales && (
            <div
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 300,
                fontSize: "16px",
                lineHeight: 1.85,
                color: "#000000",
                marginTop: "32px",
              }}
            >
              {textoCredenciales}
              {/\.$/.test(textoCredenciales) ? "" : "."}
            </div>
          )}

          <div style={{ marginTop: "44px" }}>
            <Link
              href={`/reservas/${p.id}`}
              style={{
                display: "inline-block",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                letterSpacing: "0.18em",
                color: "#0b0a09",
                background: "#c9a876",
                padding: "16px 36px",
              }}
            >
              RESERVAR CON {p.nombre.split(" ")[0].toUpperCase()}
            </Link>
          </div>

          <div style={{ marginTop: "48px" }}>
            <Link href="/profesionales" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#6b5228" }}>
              &larr; VOLVER AL EQUIPO
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
