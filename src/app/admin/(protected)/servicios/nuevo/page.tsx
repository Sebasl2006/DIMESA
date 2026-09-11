import { ServicioForm } from "../ServicioForm";
import { crearServicio } from "../actions";
import * as s from "../../../admin-styles";

export default function NuevoServicioPage() {
  return (
    <div style={s.container}>
      <h1 style={s.h1}>Agregar servicio</h1>
      <ServicioForm action={crearServicio} />
    </div>
  );
}
