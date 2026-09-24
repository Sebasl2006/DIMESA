import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import type { Producto } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";
import { VideoHero } from "@/components/VideoHero";

// Video de introducción por marca (opcional). Cuando tengas el video de
// otra marca listo, solo agrega su entrada aquí con el mismo slug que
// tiene en la tabla "marcas" — no hace falta tocar nada más de esta página.
const MARCA_VIDEO: Partial<Record<string, string>> = {
  botanique: "/videos/botanique-hero.mp4",
  revlon: "/videos/revlon-hero.mp4",
  olaplex: "/videos/olaplex-hero.mp4",
  truss: "/videos/truss-hero.mp4",
  mq_professional: "/videos/mq-hero.mp4",
};

// Imagen de portada de cada video — se ve de inmediato mientras el video
// carga/decodifica, evitando la pantalla negra en conexiones lentas.
const MARCA_VIDEO_POSTER: Partial<Record<string, string>> = {
  botanique: "/images/botanique-hero-poster.jpg",
  revlon: "/images/revlon-hero-poster.jpg",
  olaplex: "/images/olaplex-hero-poster.jpg",
  truss: "/images/truss-hero-poster.jpg",
  mq_professional: "/images/mq-hero-poster.jpg",
};

// Texto superpuesto sobre el video (título + descripción de producto).
// Opcional, igual que MARCA_VIDEO — solo tiene efecto si esa marca
// también tiene video.
const MARCA_OVERLAY: Partial<Record<string, { titulo: string; texto: string }>> = {
  botanique: {
    titulo: "Divine Potion 15 en 1",
    texto: "Elixir multi-beneficios con protección UV integrada. Repara, suaviza y reestructura la fibra capilar sin aportar peso.",
  },
  revlon: {
    titulo: "Orofluido Original Elixir",
    texto: "Elixir de belleza con Argán, Lino y Cípero, textura sedosa de rápida absorción. Presentación: 100 ml.",
  },
  olaplex: {
    titulo: "Nº3 Plus Complete Repair Treatment",
    texto: "Tratamiento reparador que actúa en 3 minutos, penetra profundamente y deja el cabello hasta 3 veces más fuerte y suave.",
  },
  truss: {
    titulo: "Equilibrium",
    texto: "Scalp care para cuero cabelludo graso y puntas secas. Controla el balance de aceite y humedad.",
  },
  mq_professional: {
    titulo: "PRO 480 Turbo LED",
    texto: "Plancha profesional con placas de titanio ultrasuaves de 32mm y modo turbo hasta 252°C. Tecnología MCH, HSC e iónica, con pantalla LED.",
  },
};

export default async function MarcaPage({ params }: { params: Promise<{ marca: string }> }) {
  const { marca } = await params;
  const supabase = createPublicClient();
  const { data: marcaInfo } = await supabase.from("marcas").select("nombre").eq("slug", marca).maybeSingle();
  if (!marcaInfo) notFound();
  const label = marcaInfo.nombre;

  const videoSrc = MARCA_VIDEO[marca];
  const overlayData = MARCA_OVERLAY[marca];
  const overlay = overlayData ? (
    // 68vw (en vez de 86vw) deja espacio libre para que el logo de Dimesa
    // en la esquina inferior derecha del video no se monte sobre la última
    // línea del texto en pantallas angostas (celular).
    <div style={{ maxWidth: "min(560px, 68vw)" }}>
      <div
        className="font-serif"
        style={{ fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 3.2rem)", color: "#e6d3ac", lineHeight: 1.1 }}
      >
        {overlayData.titulo}
      </div>
      <div
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 300,
          fontSize: "clamp(13px, 1.6vw, 15px)",
          lineHeight: 1.6,
          color: "#d8d0c2",
          marginTop: "16px",
          maxWidth: "440px",
        }}
      >
        {overlayData.texto}
      </div>
    </div>
  ) : undefined;

  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("marca", marca)
    .eq("disponible", true)
    .order("created_at", { ascending: false });

  const content = (
    <div style={{ paddingTop: videoSrc ? 0 : "76px" }}>
      <div style={{ padding: "32px 24px 0" }}>
        <Link href="/productos" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#6b5228" }}>
          &larr; VOLVER A MARCAS
        </Link>
      </div>

      <div style={{ textAlign: "center", padding: "40px 24px 56px" }}>
        <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.3em", color: "#6b5228", marginBottom: "14px" }}>
          TIENDA
        </div>
        <div className="font-serif" style={{ fontWeight: 300, fontSize: "clamp(2rem, 4.5vw, 3rem)", color: "#3d2f1a" }}>
          {label}
        </div>
      </div>

      <ProductGrid productos={(productos ?? []) as Producto[]} />

      <div style={{ textAlign: "center", padding: "0 24px 90px" }}>
        <Link href="/#top" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: "11px", letterSpacing: "0.2em", color: "#6b5228" }}>
          &larr; VOLVER AL INICIO
        </Link>
      </div>
    </div>
  );

  // Logo de Dimesa superpuesto en la esquina inferior derecha del video
  // — mismo tratamiento en todas las marcas con video hero.
  const cornerLogo = videoSrc ? "/images/dimesa-logo.png" : undefined;

  if (videoSrc) {
    return (
      <VideoHero src={videoSrc} poster={MARCA_VIDEO_POSTER[marca]} overlay={overlay} cornerLogo={cornerLogo}>
        {content}
      </VideoHero>
    );
  }

  return content;
}
