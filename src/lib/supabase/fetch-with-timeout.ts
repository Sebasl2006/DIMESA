// Si Supabase está pausado (plan gratuito, se pausa por inactividad) o
// tarda en "despertar", las peticiones normales del SDK pueden quedarse
// colgadas 30-60+ segundos en vez de fallar rápido — eso es lo que hizo
// que la tienda tardara "2 minutos" en abrir. Este fetch corta la espera
// a los 10s: la página muestra su estado vacío/de respaldo en vez de
// congelarse, y el siguiente refresco ya encuentra a Supabase despierto.
export function fetchWithTimeout(timeoutMs = 10000) {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(input, { ...init, signal: init?.signal ?? controller.signal }).finally(() =>
      clearTimeout(timer)
    );
  };
}
