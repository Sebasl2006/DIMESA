import { ProfesionalForm } from "../ProfesionalForm";
import { crearProfesional } from "../actions";
import * as s from "../../../admin-styles";

export default function NuevoProfesionalPage() {
  return (
    <div style={s.container}>
      <h1 style={s.h1}>Agregar profesional</h1>
      <ProfesionalForm action={crearProfesional} />
    </div>
  );
}
