import * as s from "../admin-styles";

// Se muestra al instante mientras carga cualquier pestaña del panel, en vez
// de dejar la pantalla anterior congelada sin señal de que algo está pasando.
export default function CargandoPanel() {
  return (
    <div style={s.container}>
      <div style={{ color: "#c9a876", fontSize: "14px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "40px 0" }}>
        Cargando...
      </div>
    </div>
  );
}
