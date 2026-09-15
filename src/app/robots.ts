import type { MetadataRoute } from "next";

// Le dice a Google (y a cualquier buscador) qué puede rastrear del sitio.
// Sin este archivo, Next.js no genera /robots.txt — un sitio sin uno
// todavía se puede indexar, pero no está de más ser explícitos: todo
// público es rastreable, /admin no (no hay nada que un buscador deba
// mostrar ahí, y ya está protegido por login de todos modos).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: "https://dimesaspa.com/sitemap.xml",
  };
}
