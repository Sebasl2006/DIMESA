"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Producto } from "@/lib/types";

const CART_STORAGE_KEY = "dimesa-carrito";

export interface CartLine {
  producto: Producto;
  qty: number;
}

interface CartContextValue {
  cartLines: CartLine[];
  cartCount: number;
  subtotal: number;
  drawerOpen: boolean;
  addToCart: (producto: Producto) => void;
  incQty: (id: string) => void;
  decQty: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  openDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// Carrito del lado del cliente (sin base de datos hasta el checkout, como
// pide el diseño original). Se guarda en localStorage porque el pago con
// tarjeta (Payphone) redirige fuera del sitio y de vuelta — sin esto, el
// carrito se perdía cada vez que alguien cancelaba o volvía de un pago.
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const yaCargado = useRef(false);

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CART_STORAGE_KEY);
      if (guardado) setCart(JSON.parse(guardado));
    } catch {
      // localStorage puede fallar (modo privado, etc.) — el carrito
      // simplemente empieza vacío, no es un error que deba interrumpir nada.
    } finally {
      yaCargado.current = true;
    }
  }, []);

  useEffect(() => {
    if (!yaCargado.current) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ver comentario arriba.
    }
  }, [cart]);

  const addToCart = (producto: Producto) =>
    setCart((c) => ({
      ...c,
      [producto.id]: { producto, qty: (c[producto.id]?.qty ?? 0) + 1 },
    }));

  const incQty = (id: string) =>
    setCart((c) => (c[id] ? { ...c, [id]: { ...c[id], qty: c[id].qty + 1 } } : c));

  const decQty = (id: string) =>
    setCart((c) => {
      const line = c[id];
      if (!line) return c;
      if (line.qty <= 1) {
        const next = { ...c };
        delete next[id];
        return next;
      }
      return { ...c, [id]: { ...line, qty: line.qty - 1 } };
    });

  const removeItem = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });

  const clearCart = () => setCart({});
  const toggleDrawer = () => setDrawerOpen((v) => !v);
  const closeDrawer = () => setDrawerOpen(false);
  const openDrawer = () => setDrawerOpen(true);

  const cartLines = Object.values(cart);
  const cartCount = cartLines.reduce((sum, l) => sum + l.qty, 0);
  const subtotal = cartLines.reduce((sum, l) => sum + l.producto.precio * l.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartLines,
        cartCount,
        subtotal,
        drawerOpen,
        addToCart,
        incQty,
        decQty,
        removeItem,
        clearCart,
        toggleDrawer,
        closeDrawer,
        openDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de /productos (CartProvider)");
  return ctx;
}
