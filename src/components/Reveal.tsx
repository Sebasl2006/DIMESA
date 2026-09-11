"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  // "up" (por defecto, comportamiento original): sube desde abajo con fade.
  // "left"/"right": entra deslizándose desde ese lado — para bloques cuya
  // imagen o texto está posicionado a la izquierda o derecha (ver reservas).
  direction?: "up" | "left" | "right";
  distance?: number;
  // true (por defecto): se anima una sola vez y se queda visible. false: se
  // oculta otra vez al salir de pantalla y se vuelve a animar cada vez que
  // el bloque entra, tantas veces como el usuario suba y baje el scroll.
  once?: boolean;
  style?: CSSProperties;
}

// Aparición sutil (fade + deslizamiento) al hacer scroll. Sin librería de
// animación en el proyecto, así que se resuelve con IntersectionObserver
// + una transición inline — mismo enfoque que ya usa el hero del video.
// rootMargin positivo en el borde inferior dispara la animación un poco
// antes de que el bloque esté 100% visible, para que no se sienta tarde.
// Si el usuario tiene prefers-reduced-motion activado, se muestra directo
// sin animar nada.
export function Reveal({ children, delay = 0, direction = "up", distance, once = true, style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0, rootMargin: "0px 0px 120px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const dist = distance ?? (direction === "up" ? 28 : 48);
  const hiddenTransform =
    direction === "left" ? `translateX(-${dist}px)` : direction === "right" ? `translateX(${dist}px)` : `translateY(${dist}px)`;

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0, 0)" : hiddenTransform,
        transition: reducedMotion ? "none" : `opacity 0.7s ease-out ${delay}s, transform 0.7s ease-out ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
