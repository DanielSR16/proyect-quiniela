-- Apodo para iniciar sesión (junto con el correo). Único sin importar mayúsculas, sin espacios ni '@'.
alter table public.profiles add column nickname text;

-- Los usuarios existentes arrancan con su primer nombre en minúsculas.
update public.profiles set nickname = lower(split_part(btrim(name), ' ', 1));

alter table public.profiles
  alter column nickname set not null,
  add constraint profiles_nickname_format check (nickname ~ '^[^\s@]{3,30}$');
create unique index profiles_nickname_unique on public.profiles (lower(nickname));

-- El perfil se crea con el apodo que viaja en user_metadata (lo manda solo el servidor al crear el usuario).
create or replace function private.create_profile() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, nickname)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nickname'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;
