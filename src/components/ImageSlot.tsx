"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";

interface ImageSlotProps {
  src?: string | null;
  alt: string;
  placeholder: string;
  style?: CSSProperties;
  // Ajusta esto por cada lugar donde se use ImageSlot para que coincida
  // con el ancho real del contenedor — un valor genérico ("50vw" en todos
  // lados) hace que el navegador pida una imagen más chica de la que
  // realmente necesita en grids de tarjetas angostas, y eso se ve borroso.
  sizes?: string;
  quality?: number;
  // true para las fotos que se ven apenas abre la página (sin hacer scroll):
  // el navegador las baja de inmediato y con prioridad alta, en vez de
  // esperar a que las "descubra" y las trate como cualquier otra imagen.
  eager?: boolean;
}

// Reemplaza una foto real cuando el producto/servicio todavía no tiene
// "imagen_url" cargada desde el admin: una caja discreta con el nombre.
export function ImageSlot({
  src,
  alt,
  placeholder,
  style,
  sizes = "(max-width: 768px) 100vw, 50vw",
  // 75 (en vez de 100) recorta bastante el peso del archivo sin pérdida
  // visible en el tamaño en que estas fotos se muestran — con catálogos
  // grandes (ej. Revlon, +150 productos) esto es lo que más nota el
  // cliente mientras baja por la página.
  quality = 75,
  eager = false,
}: ImageSlotProps) {
  const [cargada, setCargada] = useState(false);

  if (src) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "#161412",
          ...style,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          quality={quality}
          loading={eager ? "eager" : undefined}
          fetchPriority={eager ? "high" : undefined}
          style={{
            objectFit: "cover",
            opacity: cargada ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
          sizes={sizes}
          onLoad={() => setCargada(true)}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "12px",
        background: "#161412",
        border: "1px solid rgba(201,168,118,0.15)",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 300,
        fontSize: "11px",
        letterSpacing: "0.08em",
        color: "#5c5548",
        ...style,
      }}
    >
      {placeholder}
    </div>
  );
}
