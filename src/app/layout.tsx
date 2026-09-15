import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  // 700 se agregó para la viñeta de /profesionales/[id] — necesita negrita
  // de verdad (no la negrita sintética del navegador) para leerse bien.
  weight: ["300", "400", "500", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});

const SITE_URL = "https://dimesaspa.com";
const DESCRIPCION =
  "Dimesa es un salón de belleza de lujo en Cuenca, Ecuador, especializado en salud capilar, colorimetría y tratamientos faciales y corporales. Reserva tu cita.";

// metadataBase + los campos de abajo (Open Graph, Twitter, robots) son lo
// que Google/redes usan para armar la vista previa cuando alguien comparte
// o busca el sitio — antes de esto, la página no tenía nada de esto
// configurado, solo un título y descripción básicos.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dimesa · Salón de Belleza y Salud Capilar en Cuenca, Ecuador",
    template: "%s · Dimesa",
  },
  description: DESCRIPCION,
  keywords: [
    "Dimesa",
    "Dimesa Spa",
    "dimesaspa",
    "salón de belleza Cuenca",
    "salud capilar Cuenca",
    "peluquería Cuenca Ecuador",
    "colorimetría Cuenca",
    "spa Cuenca Ecuador",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Dimesa · Salón de Belleza y Salud Capilar en Cuenca, Ecuador",
    description: DESCRIPCION,
    url: SITE_URL,
    siteName: "Dimesa",
    locale: "es_EC",
    type: "website",
    images: [{ url: "/images/dimesa-logo-full.png", width: 1081, height: 471, alt: "Dimesa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dimesa · Salón de Belleza y Salud Capilar en Cuenca, Ecuador",
    description: DESCRIPCION,
    images: ["/images/dimesa-logo-full.png"],
  },
};

// Datos estructurados (JSON-LD): le dicen a Google explícitamente que
// dimesaspa.com ES el sitio oficial de un negocio real llamado "Dimesa" en
// Cuenca, con esta dirección, teléfono y horario — ayuda tanto a que
// aparezca en resultados de búsqueda como en Google Maps/el panel lateral
// de "conocimiento" cuando alguien busca el nombre del negocio. Los datos
// (dirección, teléfono, horario) son los mismos que ya se muestran en
// /informacion — si cambian ahí, hay que actualizarlos aquí también.
const NEGOCIO_JSON_LD = {
  "@context": "https://schema.org",
  "@type": ["HairSalon", "BeautySalon"],
  name: "Dimesa",
  image: `${SITE_URL}/images/dimesa-logo-full.png`,
  url: SITE_URL,
  telephone: "+593999888100",
  address: {
    "@type": "PostalAddress",
    streetAddress: "C. Gran Colombia, Edificio Excalibur",
    addressLocality: "Cuenca",
    addressCountry: "EC",
  },
  areaServed: "Cuenca, Ecuador",
  priceRange: "$$",
  // Perfiles oficiales del mismo negocio — ayuda a Google a relacionar el
  // sitio con las cuentas de redes sociales que ya aparecen al buscar
  // "Dimesa" (Instagram, TikTok...). Agregar aquí cualquier otra que
  // Sebastián confirme.
  sameAs: ["https://www.instagram.com/dimesa.cuenca", "https://www.tiktok.com/@dimesa_spa"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "13:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "14:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(NEGOCIO_JSON_LD) }}
        />
      </body>
    </html>
  );
}
