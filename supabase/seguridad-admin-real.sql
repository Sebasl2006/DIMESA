-- ════════════════════════════════════════════════════════════════
-- DIMESA — Cierra el hueco de seguridad: "authenticated" solo
-- significa "hay una sesión de Supabase Auth", NO significa "es el
-- dueño del negocio". Si el registro público de cuentas está
-- habilitado en el proyecto (es el valor por defecto en Supabase),
-- cualquier persona puede crear una cuenta gratis y, con las políticas
-- viejas, esa cuenta podía crear/editar/borrar productos, servicios,
-- profesionales, información del sitio y fotos — sin ser el dueño.
--
-- Esto reemplaza cada política "to authenticated" por un chequeo contra
-- la lista de correos admin reales (hoy: el dueño + el cliente al que
-- se le vendió el sitio). Para agregar o quitar un correo admin más
-- adelante, vuelve a correr este archivo completo cambiando la lista
-- ADMIN_EMAILS de abajo.
--
-- Corre esto en Supabase → SQL Editor → New query → Run.
--
-- IMPORTANTE: además de correr esto, ve a tu proyecto de Supabase →
-- Authentication → Sign In / Providers → y desactiva "Allow new users
-- to sign up" (o el interruptor equivalente que diga "permitir
-- registro"). Esta consulta es la segunda capa; esa casilla es la
-- primera y cierra el hueco de raíz (nadie más se puede registrar).
-- ════════════════════════════════════════════════════════════════

-- Lista única de correos admin — se reutiliza en todas las políticas.
-- auth.jwt() ->> 'email' devuelve el correo del usuario que hace la
-- petición; ANY(ARRAY[...]) compara contra la lista.
-- Correos actuales: dueño (2006sacura@gmail.com) + cliente (daos1020@gmail.com).

-- ── productos ────────────────────────────────────────────────────
drop policy if exists "Admin ve todos los productos" on productos;
drop policy if exists "Admin crea productos" on productos;
drop policy if exists "Admin actualiza productos" on productos;
drop policy if exists "Admin elimina productos" on productos;

create policy "Admin ve todos los productos" on productos for select
  to authenticated using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin crea productos" on productos for insert
  to authenticated with check ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin actualiza productos" on productos for update
  to authenticated
  using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']))
  with check ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin elimina productos" on productos for delete
  to authenticated using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));

-- ── servicios ────────────────────────────────────────────────────
drop policy if exists "Admin crea servicios" on servicios;
drop policy if exists "Admin actualiza servicios" on servicios;
drop policy if exists "Admin elimina servicios" on servicios;

create policy "Admin crea servicios" on servicios for insert
  to authenticated with check ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin actualiza servicios" on servicios for update
  to authenticated
  using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']))
  with check ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin elimina servicios" on servicios for delete
  to authenticated using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));

-- ── profesionales ────────────────────────────────────────────────
drop policy if exists "Admin crea profesionales" on profesionales;
drop policy if exists "Admin actualiza profesionales" on profesionales;
drop policy if exists "Admin elimina profesionales" on profesionales;

create policy "Admin crea profesionales" on profesionales for insert
  to authenticated with check ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin actualiza profesionales" on profesionales for update
  to authenticated
  using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']))
  with check ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin elimina profesionales" on profesionales for delete
  to authenticated using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));

-- ── informacion ──────────────────────────────────────────────────
drop policy if exists "Admin actualiza información" on informacion;

create policy "Admin actualiza información" on informacion for update
  to authenticated
  using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']))
  with check ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));

-- ── pedidos (el admin los lee/gestiona desde el panel) ──────────
drop policy if exists "Admin ve pedidos" on pedidos;
drop policy if exists "Admin actualiza pedidos" on pedidos;
drop policy if exists "Admin elimina pedidos" on pedidos;

create policy "Admin ve pedidos" on pedidos for select
  to authenticated using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin actualiza pedidos" on pedidos for update
  to authenticated
  using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']))
  with check ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin elimina pedidos" on pedidos for delete
  to authenticated using ((auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));

-- ── storage: fotos de productos/servicios/profesionales ─────────
drop policy if exists "Admin sube fotos" on storage.objects;
drop policy if exists "Admin reemplaza fotos" on storage.objects;
drop policy if exists "Admin borra fotos" on storage.objects;

create policy "Admin sube fotos" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'dimesa' and (auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin reemplaza fotos" on storage.objects for update
  to authenticated
  using (bucket_id = 'dimesa' and (auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']))
  with check (bucket_id = 'dimesa' and (auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
create policy "Admin borra fotos" on storage.objects for delete
  to authenticated
  using (bucket_id = 'dimesa' and (auth.jwt() ->> 'email') = any (array['2006sacura@gmail.com', 'daos1020@gmail.com']));
