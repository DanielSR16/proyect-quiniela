import { consultar } from "./db.js";

export interface FilaRanking {
  id: number;
  nombre: string;
  puntos: number;
  exactos: number;
  posicion: number;
}

// Orden: más puntos, luego más marcadores exactos; si siguen iguales comparten posición (1, 2, 2, 4).
export async function calcularRanking(jornada?: number): Promise<FilaRanking[]> {
  const { rows } = await consultar<Omit<FilaRanking, "posicion">>(
    `select u.id, u.nombre,
            coalesce(sum(x.puntos), 0)::int as puntos,
            (count(*) filter (where x.puntos = 5))::int as exactos
       from usuarios u
       left join (
         select p.usuario_id, p.puntos
           from predicciones p
           join partidos m on m.id = p.partido_id
          where ($1::int is null or m.jornada = $1)
       ) x on x.usuario_id = u.id
      group by u.id, u.nombre
      order by puntos desc, exactos desc, u.nombre`,
    [jornada ?? null],
  );

  const ranking: FilaRanking[] = [];
  rows.forEach((fila, i) => {
    const previa = ranking[i - 1];
    const empatado = previa && previa.puntos === fila.puntos && previa.exactos === fila.exactos;
    ranking.push({ ...fila, posicion: empatado ? previa.posicion : i + 1 });
  });
  return ranking;
}
