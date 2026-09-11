"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";

export function ProductosHeader() {
  const { cartCount, toggleDrawer } = useCart();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "76px",
        background: "rgba(11,10,9,0.94)",
        backdropFilter: "blur(6px)",
        borderBottom: "1px solid rgba(201,168,118,0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        zIndex: 50,
        boxSizing: "border-box",
      }}
    >
      <Link href="/#top" style={{ display: "flex", alignItems: "center" }}>
        <Image src="/images/dimesa-logo.png" alt="Dimesa" width={1076} height={361} priority style={{ height: "34px", width: "auto" }} />
      </Link>
      <button
        onClick={toggleDrawer}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#c9a876", position: "relative", display: "flex", alignItems: "center", padding: "6px" }}
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M6 8h12l-1 12H7L6 8z" />
          <path d="M9 8V6a3 3 0 016 0v2" />
        </svg>
        <span
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "#c9a876",
            color: "#0b0a09",
            borderRadius: "50%",
            width: "16px",
            height: "16px",
            fontSize: "10px",
            fontFamily: "var(--font-montserrat), sans-serif",
            display: cartCount > 0 ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cartCount}
        </span>
      </button>
    </div>
  );
}
