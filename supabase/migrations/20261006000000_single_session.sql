-- Sesión única por usuario: al iniciar sesión se revocan las demás (desde la Server Action de login),
-- y aquí las políticas dejan de aceptar tokens cuya sesión ya no existe en auth.sessions.
-- Así el dispositivo anterior pierde el acceso al instante, sin esperar a que expire su token.
create or replace function private.is_active() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and not blocked)
    and exists (select 1 from auth.sessions where id = ((select auth.jwt()) ->> 'session_id')::uuid);
$$;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin' and not blocked)
    and exists (select 1 from auth.sessions where id = ((select auth.jwt()) ->> 'session_id')::uuid);
$$;
