-- La función solo la usa el trigger de eventos ensure_rls; no debe poder llamarse desde /rest/v1/rpc/.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
