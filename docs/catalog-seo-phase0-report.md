# Catalog SEO — FASE 0 (medición)

## Sitemap URL counts

| Snapshot | Model URLs | Taxonomy (non-static) | Total |
|----------|------------|------------------------|-------|
| `0f1ab89` (antes de `d320e43`) | 527 | 6 idiomas | 538 |
| `f3cb7b9` (con overlay live `d320e43`) | 527 | 6 idiomas + 1 categoría (Mature live) | 539 |
| Rama `cursor/catalog-seo-infinite-1244` (catálogo) | **623** | **44** facetas/combos + 6 idiomas | **672** (índice + 2 shards) |

`d320e43` no redujo modelos; redujo facetas de catálogo al sustituir taxonomía por inventario **live** (~1 categoría).

## Catálogo CRAK (config actual)

- **Marcas:** `CRAK_BRANDS` → por defecto `streamate` si no está definido.
- **Paginación:** `page`, `size` (hasta 48), `sorting`, `live` (false = incluye offline), `tags`, `ages`, `ethnicities`, `gender`, `lang`, `brands`.
- **Filtros actuales en código:** `tags=milf,mature,housewife`, `ages=gc_40_49,gc_50_plus`, `gender=f`, `live=false` para catálogo.
- **Resultado (13 páginas):** 620 filas → **623** modelos únicos con thumbnail; **0 live** en pasada offline; ~31 en pasada solo-live.
- **Por qué &lt;1000:** techo real del feed con esos filtros + una marca; no es límite de `SITEMAP_MAX_PAGES` (ahora 50). Propuesta (no implementada): ampliar `CRAK_BRANDS`, relajar `ages`/tags, o paginar sin filtro de edad CRAK para inventario global.

## Distribución (catálogo, offline pass)

Ver salida de `node --import tsx scripts/catalog-seo-phase0.mjs` — resumen: edades 40–49 dominante; Colombia/US/UK; etnias White/Hispanic; pelo Blond/Brown/Black; bust B–DD; figuras Curvaceous/Average.

## `mapPerformerTaxonomy` (antes → después)

**Problema:** `COUGAR_SIGNALS` incluía `"mature"`; edad 35–49 añadía MILF y ≥40 Mature → casi todos en los cuatro nichos.

**Reglas nuevas (implementadas):** MILF/cougar/mom por tags explícitos; Mature por edad ≥40 o tags mature/gc_*; prioridad `mature > milf > cougar > mom` para `primaryCategory`.

**Nichos tras corrección (623 modelos):** ejecutar audit en CI; expectativa: Mature mayoría, MILF/mom/cougar solo con señal de tag.

## Umbral único

`src/lib/taxonomy/settings.ts`: `FACET_SITEMAP_MIN_COUNT` y `FACET_MENU_MIN_COUNT` (= 8).
