import { CartProvider } from "./CartContext";
import { ProductosHeader } from "./ProductosHeader";
import { CartDrawer } from "./CartDrawer";
import { FondoLayer } from "@/components/FondoLayer";

export default function ProductosLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div style={{ background: "#0b0a09", minHeight: "100vh" }}>
        <FondoLayer />
        <div style={{ position: "relative", zIndex: 1 }}>
          <ProductosHeader />
          {children}
          <CartDrawer />
        </div>
      </div>
    </CartProvider>
  );
}
