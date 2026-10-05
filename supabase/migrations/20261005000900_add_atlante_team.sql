-- Atlante también juega en Liga MX en este torneo.
insert into public.teams (name, short_name, slug) values ('Atlante', 'ATN', 'atlante') on conflict do nothing;
