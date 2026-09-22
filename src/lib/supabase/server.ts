import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { fetchWithTimeout } from "./fetch-with-timeout";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Cliente de Supabase para Server Components, Server Actions y Route Handlers.
// Lee/escribe la sesión del usuario admin a través de cookies.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll fue llamado desde un Server Component sin middleware
            // que refresque la sesión. Se puede ignorar si el middleware
            // ya se encarga de mantener la sesión viva.
          }
        },
      },
      global: { fetch: fetchWithTimeout() },
    }
  );
}

// Cliente de solo lectura para las páginas PÚBLICAS (catálogo, servicios,
// profesionales, fondo...): usa la llave anónima y NO lee cookies. Leer
// cookies (como hace createClient) obliga a Next.js a generar la página de
// nuevo en el servidor en cada visita, aunque no dependa de ningún usuario
// — eso era lo que hacía lenta la apertura de cada sección. Sin cookies,
// la página se genera una vez, se guarda y se sirve al instante (ver
// "revalidate" en cada página). Ve exactamente lo mismo que ve un visitante
// cualquiera: las mismas reglas RLS que ya protegen la base de datos.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchWithTimeout() },
    }
  );
}

// Cliente con la service_role key: ignora RLS por completo.
// Úsalo SOLO en código de servidor (route handlers) que ya validó
// lo que va a escribir — nunca lo importes en un componente cliente.
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false }, global: { fetch: fetchWithTimeout() } }
  );
}

// Lista blanca de correos que pueden administrar el sitio. "authenticated"
// en Supabase solo significa "alguien inició sesión" — NO significa que sea
// el dueño del negocio. Si el proyecto de Supabase llegara a tener el
// registro público habilitado, cualquiera podría crearse una cuenta y
// pasar el chequeo de "hay sesión" sin esto. Ver ADMIN_EMAILS en .env.local.
function esCorreoAdmin(email: string | undefined | null): boolean {
  const permitidos = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && permitidos.includes(email.toLowerCase());
}

// Defensa adicional dentro de cada Server Action del admin: el proxy
// (src/proxy.ts) ya bloquea /admin/* sin sesión Y sin correo autorizado,
// y RLS ya bloquea la escritura sin sesión — esto es una tercera capa que
// corta la acción de inmediato, con un mensaje claro, sin depender de que
// las otras dos sigan cubriendo exactamente esta ruta si el código cambia
// más adelante.
export async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado. Vuelve a iniciar sesión.");
  if (!esCorreoAdmin(user.email)) throw new Error("No autorizado.");
  return user;
}
