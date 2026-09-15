import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://dimesaspa.com";

// Le da a Google la lista completa de páginas del sitio para que las
// encuentre más rápido, en vez de tener que descubrirlas solo siguiendo
// enlaces. Las marcas y profesionales se listan dinámicamente desde la
// base de datos — una marca o profesional nuevo que se agregue desde el
// admin aparece aquí solo, sin tocar este archivo.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [{ data: marcas }, { data: profesionales }] = await Promise.all([
    supabase.from("marcas").select("slug"),
    supabase.from("profesionales").select("id").eq("disponible", true),
  ]);

  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/reservas`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/productos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/profesionales`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/informacion`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const marcaUrls: MetadataRoute.Sitemap = (marcas ?? []).map((m) => ({
    url: `${SITE_URL}/productos/${m.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const profesionalUrls: MetadataRoute.Sitemap = (profesionales ?? []).map((p) => ({
    url: `${SITE_URL}/profesionales/${p.id}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...estaticas, ...marcaUrls, ...profesionalUrls];
}
