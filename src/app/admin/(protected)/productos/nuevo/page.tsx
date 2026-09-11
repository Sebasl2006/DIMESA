import { ProductoForm } from "../ProductoForm";
import { crearProducto } from "../actions";
import * as s from "../../../admin-styles";

export default function NuevoProductoPage() {
  return (
    <div style={s.container}>
      <h1 style={s.h1}>Agregar producto</h1>
      <ProductoForm action={crearProducto} />
    </div>
  );
}
