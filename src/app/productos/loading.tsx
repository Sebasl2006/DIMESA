import { CargandoSeccion } from "@/components/CargandoSeccion";

// Dentro de /productos (con su encabezado y carrito ya visibles): las marcas
// y sus tiendas son oscuras, así que la pantalla de carga también.
export default function Cargando() {
  return <CargandoSeccion oscuro />;
}
