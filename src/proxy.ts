import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { fetchWithTimeout } from "./lib/supabase/fetch-with-timeout";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// "authenticated" en Supabase solo significa "hay una sesión", no "es el
// dueño del negocio" — si el registro público estuviera habilitado en el
// proyecto de Supabase, cualquiera podría crear una cuenta nueva y pasar
// el chequeo de sesión. Por eso además se exige que el correo de la
// sesión esté en ADMIN_EMAILS (.env.local). Mismo chequeo que requireAdmin()
// en src/lib/supabase/server.ts — dos capas independientes.
function esCorreoAdmin(email: string | undefined | null): boolean {
  const permitidos = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && permitidos.includes(email.toLowerCase());
}

// Protege todo lo que esté bajo /admin: si no hay sesión de Supabase Auth,
// o la sesión no es de un correo autorizado, redirige a /admin/login.
// El resto del sitio (público) no pasa por aquí.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
      global: { fetch: fetchWithTimeout() },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = esCorreoAdmin(user?.email);

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (pathname.startsWith("/admin") && !isLoginPage && !isAdmin) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && isAdmin) {
    return NextResponse.redirect(new URL("/admin/productos", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
