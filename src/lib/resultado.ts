// Lo que devuelven las acciones del panel de administración. En producción,
// Next.js oculta el mensaje de cualquier error que una Server Action
// "lance" (throw) y el navegador solo recibe un texto genérico en inglés
// ("Minified React error #441…"). Por eso las acciones NO lanzan: atrapan el
// error y lo devuelven como valor, para que el formulario pueda mostrar el
// mensaje real, en español, tal cual está escrito en el servidor.
export type ResultadoAccion = { ok: true } | { ok: false; error: string };
