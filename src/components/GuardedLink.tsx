"use client";

import Link, { type LinkProps } from "next/link";
import { useRef, useState, type ReactNode, type CSSProperties } from "react";

interface GuardedLinkProps extends LinkProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

// Cuando alguien aplasta el mismo enlace varias veces seguidas (por
// impaciencia, viendo que "no abre"), cada clic dispara su propia
// navegación — y esas navegaciones repetidas al mismo sitio chocan entre
// sí en el router de Next.js, a veces dejando la página sin cambiar nunca
// aunque el servidor sí respondió. Este Link ignora los clics de más
// después del primero (que ya está en camino) y se ve apagado mientras
// tanto, para que quede claro que sí se registró el clic.
export function GuardedLink({ className, style, children, ...linkProps }: GuardedLinkProps) {
  const yaClickeado = useRef(false);
  const [cargando, setCargando] = useState(false);

  return (
    <Link
      {...linkProps}
      className={className}
      style={{
        ...style,
        opacity: cargando ? 0.6 : style?.opacity ?? 1,
        transition: "opacity 0.2s ease",
      }}
      onClick={(e) => {
        if (yaClickeado.current) {
          e.preventDefault();
          return;
        }
        yaClickeado.current = true;
        setCargando(true);
      }}
    >
      {children}
    </Link>
  );
}
