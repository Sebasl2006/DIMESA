// Si Supabase está pausado (plan gratuito, se pausa por inactividad) o
// tarda en "despertar", las peticiones normales del SDK pueden quedarse
// colgadas 30-60+ segundos en vez de fallar rápido — eso es lo que hizo
// que la tienda tardara "2 minutos" en abrir. Este fetch corta la espera
// a los 10s: la página muestra su estado vacío/de respaldo en vez de
// congelarse, y el siguiente refresco ya encuentra a Supabase despierto.
//
// Además pide siempre datos frescos ("no-store"): sin esto, Next.js guarda
// las respuestas de Supabase en su propia caché y, con varias copias del
// sitio corriendo a la vez en el hosting, cada copia podía seguir mostrando
// lo de antes — así se veía un producto ya oculto aparecer y desaparecer de
// la tienda durante casi un minuto.
export function fetchWithTimeout(timeoutMs = 10000) {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(input, { cache: "no-store", ...init, signal: init?.signal ?? controller.signal }).finally(() =>
      clearTimeout(timer)
    );
  };
}
