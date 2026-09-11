/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Los formularios del admin (productos/servicios/profesionales) suben
    // fotos como parte del Server Action — el límite por defecto de
    // Next.js (1MB) es más chico que el que ya validamos nosotros mismos
    // en imagenValida() (5MB, ver src/lib/validation.ts), así que una foto
    // de celular normal rebotaba con el error genérico de Next antes de
    // llegar a nuestra propia validación. Los igualamos en 5MB.
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Next.js restringe qué valores de "quality" acepta next/image a esta
    // lista (default: solo 75). Las fotos de producto necesitan más para
    // que se lea el texto de la etiqueta — ver ImageSlot.tsx.
    qualities: [75, 90, 100],
  },
  // Cabeceras de seguridad — Next.js no las manda por defecto. Van en todas
  // las rutas porque hay páginas sensibles (login de admin, checkout con
  // pago) y no vale la pena mantener una lista aparte de cuáles sí y cuáles no.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Evita que /admin/login o el checkout se puedan cargar dentro de
          // un <iframe> en otro sitio (clickjacking: un atacante superpone
          // botones invisibles sobre los tuyos para robar clics/datos).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // El navegador no debe "adivinar" el tipo de un archivo distinto
          // al que el servidor declaró (evita ciertos trucos de XSS vía
          // archivos subidos que se hacen pasar por otro tipo).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No manda la URL completa (con posibles datos sensibles en la
          // ruta) como referer al saltar a un sitio externo.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
