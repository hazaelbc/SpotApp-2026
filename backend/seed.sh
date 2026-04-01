#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:3000"
# Lista de nombres de ejemplo (añade/edita como quieras)
places=(
  "Cafetería El Puerto"
  "Panadería La Espiga"
  "Heladería Costa Azul"
  "Taquería El Buen Sabor"
  "Librería Central"
  "Bar La Noria"
  "Restaurante Mar y Tierra"
  "Pizzería Don Luigi"
  "Mercado La Plaza"
  "Galería Arte Vivo"
)

PLACE_IDS=()

echo "Creando places..."
for name in "${places[@]}"; do
  lat=$(awk -v min=31.85 -v max=31.90 'BEGIN{srand(); print sprintf("%.6f", min + rand()*(max-min))}')
  lng=$(awk -v min=-116.61 -v max=-116.56 'BEGIN{srand(); print sprintf("%.6f", min + rand()*(max-min))}')
  payload=$(jq -n --arg n "$name" --arg d "Descripción de $name" --arg c "Cafetería" --arg dir "Calle Principal" --argjson lat "$lat" --argjson lng "$lng" \
    '{nombre:$n, descripcion:$d, categoria:$c, direccion:$dir, latitud:$lat, longitud:$lng}')
  resp=$(curl -s -X POST "$BASE/places" -H "Content-Type: application/json" -d "$payload")
  id=$(echo "$resp" | jq -r '.id // empty')
  if [[ -z "$id" || "$id" == "null" ]]; then
    echo "Error creando place: $resp" >&2
    exit 1
  fi
  echo "Created place '$name' -> id=$id"
  PLACE_IDS+=("$id")
done

echo
echo "Creando reseñas y comentarios..."
for p in "${PLACE_IDS[@]}"; do
  for r in 1 2 3; do
    # Crear reseña
    resena_payload=$(jq -n --argjson usuarioId 1 --argjson lat 31.8667 --argjson lng -116.5964 --arg nl "Reseña $r" --argjson catId 1 --argjson placeId "$p" --arg desc "Reseña $r para place $p" \
      '{usuarioId:$usuarioId, latitud:$lat, longitud:$lng, nombreLugar:$nl, categoriaId:$catId, placeId:$placeId, descripcion:$desc}')
    res_resp=$(curl -s -X POST "$BASE/resenas" -H "Content-Type: application/json" -d "$resena_payload")
    res_id=$(echo "$res_resp" | jq -r '.id // empty')
    if [[ -z "$res_id" || "$res_id" == "null" ]]; then
      echo "Error creando reseña (place $p): $res_resp" >&2
      exit 1
    fi
    echo "  Created resena id=$res_id for place id=$p"

    # Crear 2 comentarios por reseña
    for c in 1 2; do
      comment_payload=$(jq -n --argjson usuarioId 1 --argjson resenaId "$res_id" --arg com "Comentario $c para reseña $res_id" \
        '{usuarioId:$usuarioId, resenaId:$resenaId, comentario:$com}')
      curl -s -X POST "$BASE/comentarios-resena" -H "Content-Type: application/json" -d "$comment_payload" > /dev/null
      echo "    + comentario $c creado para resena $res_id"
    done
  done
done

echo
echo "Seed completado. Places creados: ${#PLACE_IDS[@]}"