# Catalog widen — FASE 0 (medición)

## API (performers-ext)

| Parámetro | Valores observados |
|-----------|-------------------|
| **brands** | Solo **`streamate`** autorizado en esta cuenta. Otros (`livejasmin`, `chaturbate`, …) → `401 Unauthorized: brands not allowed`. No hay endpoint de listado de marcas. |
| **ages** | `gc_30_39`, `gc_40_49`, `gc_50_59`, `gc_60_plus`, `gc_50_plus` (legacy). **30–39 existe como `gc_30_39`.** |
| **tags** | Opcional; ej. `milf` (6433), `mature` (2617), `housewife` (3631), `cougar` (310), `granny` (602) en `count` de página 1. |
| **gender** | `f` \| `m` \| `c` \| `t`; con/sin `gender=f` mismo volumen en prueba wide ages. |
| **Paginación** | `page`, `size` (48), `live=false` incluye offline. |

## Conteos offline (streamate, sin tags)

| Config | Únicos (aprox.) |
|--------|------------------|
| **(a)** `ages=gc_30_39,gc_40_49,gc_50_plus`, sin tags | 1919 (tope 40 páginas en script corto) |
| **(b)** Por marca | Solo streamate > 0 |
| **(c)** Todas las marcas dedup | 1919 (= streamate) |
| **(d)** `gender=f` vs sin gender | Igual en wide ages |
| **Baseline actual** tags+mature ages | **625** |

**Pass ampliado (4 bandas × paginación completa):** **8453** únicos deduplicados por `itemId` (`scripts/catalog-widen-age-bands.mjs`). Desglose edad: 30–39: 3842, 40–49: 4487, 50–59: 93, 60+: 31.

## Afiliado / roomUrl

- Marca habilitada: **streamate** (`CRAK_BRANDS` o default).
- `roomUrl` de muestra: host `t.camsk7.com`, `systemSource: streamate`.
- **`resolveRoomUrl`** no modificado: usa `model.roomUrl` del performer cuando es `https://`.

## `CRAK_BRANDS` y sync Cloudflare

`scripts/sync-pages-preview-crak-env.mjs` **sí** incluye `CRAK_BRANDS` en el array `optional` (líneas 35–37) y lo escribe en Production/Preview cuando está en el env de GHA.

## Límite para 2000+

No es paginación interna: es **filtro tags + ages estrechos** (625). Con **sin tags + 4 bandas de edad** se superan **8000** modelos, pero **solo una marca** en la cuenta; más marcas requieren autorización CRAK.
