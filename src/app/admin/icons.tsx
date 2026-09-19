// Íconos mínimos de línea para el sidebar del admin — mismo trazo fino
// (strokeWidth 1.5-1.6) que ya usamos en el ícono del carrito y las
// tarjetas de contacto del sitio público.
const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const IconChart = () => (
  <svg {...common}>
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </svg>
);

export const IconOrders = () => (
  <svg {...common}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);

export const IconBox = () => (
  <svg {...common}>
    <path d="M3.5 7.5 12 3l8.5 4.5-8.5 4.5-8.5-4.5z" />
    <path d="M3.5 7.5V16.5L12 21l8.5-4.5V7.5" />
    <path d="M12 12v9" />
  </svg>
);

export const IconUser = () => (
  <svg {...common}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c1.4-4 4-6 7.5-6s6.1 2 7.5 6" />
  </svg>
);

export const IconSparkle = () => (
  <svg {...common}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
);

export const IconInfo = () => (
  <svg {...common}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.8v.1" />
  </svg>
);

export const IconImage = () => (
  <svg {...common}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.6" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M4.2 16.5 9 12l3 2.8 3.2-3.4 4.6 4.6" />
  </svg>
);
