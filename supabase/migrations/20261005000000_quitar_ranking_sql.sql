-- El ranking se calcula en el frontend a partir de predicciones.puntos (los calcula el trigger).
drop function if exists public.ranking(integer);
