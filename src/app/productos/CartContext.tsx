"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Producto } from "@/lib/types";

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

// Carrito en memoria del lado del cliente (sin base de datos hasta el
// checkout, como pide el diseño original). Vive en este layout de
// /productos, así que se mantiene entre la selección de marca, el grid
// filtrado y el checkout, pero se reinicia si se recarga la página.
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

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
