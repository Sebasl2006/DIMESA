// Pantalla que se ve AL INSTANTE al tocar una sección del sitio (Reservas,
// Profesionales, Información...) mientras el servidor prepara la página. Sin
// esto, la pantalla anterior se quedaba congelada varios segundos sin señal
// de que el toque había funcionado. No consulta la base de datos (por eso
// usa el fondo de mármol de siempre y no el personalizado): tiene que salir
// sin esperar nada.
export function CargandoSeccion({ oscuro = false }: { oscuro?: boolean }) {
  return (
    <div style={{ background: "#0b0a09", minHeight: "100vh", position: "relative" }}>
      {!oscuro && <div className="dimesa-bg-layer" style={{ backgroundImage: "url(/images/fondo-claro.webp)" }} />}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 400,
          fontSize: "11px",
          letterSpacing: "0.3em",
          color: oscuro ? "#c9a876" : "#6b5228",
          textTransform: "uppercase",
        }}
      >
        Cargando...
      </div>
    </div>
  );
}
