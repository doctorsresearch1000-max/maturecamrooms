# Despliegue definitivo en Cloudflare Pages (maturecamrooms)

## Diagnóstico del error que ves en Cloudflare

Si el log de **Cloudflare Pages (Git)** muestra:

```text
Build environment variables:
  - NEXT_PUBLIC_SITE_NAME: MatureCamRooms
  - NEXT_PUBLIC_SITE_URL: https://maturecamrooms.com
```

y luego falla `CRAK credentials missing`, la causa es:

| Hecho | Significado |
|--------|-------------|
| Solo aparecen `NEXT_PUBLIC_*` | El compilador de Cloudflare **no** tiene `CRAK_API_KEY` / `CRAK_TOKEN` en ese entorno de build. |
| Los secrets están en **GitHub** | **No aplican** al build de Cloudflare Git. Son pipelines distintos. |
| El commit es una rama preview (`a3bd5c7`, etc.) | Hace falta scope **Preview** en las variables de Pages, no solo Production. |

No es un fallo del código ni del sitemap: es configuración de **qué servicio compila** y **dónde viven las variables**.

## Solución recomendada (un solo pipeline)

Usar **solo GitHub Actions** (`.github/workflows/deploy.yml`), que ya tiene CRAK y `CLOUDFLARE_API_TOKEN` y hace `npm run pages:build` + `wrangler pages deploy`.

### 1. Desactivar el build automático de Cloudflare Git

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → proyecto **maturecamrooms**.
2. **Settings** → **Builds** / **Build configuration**.
3. **Desconectar** el repositorio Git **o** pausar builds automáticos (según la UI actual).
4. Deja el proyecto activo para recibir **direct uploads** desde Wrangler (GitHub Actions).

Así dejas de ver builds rojos duplicados que ignoran los secrets de GitHub.

### 2. Desplegar producción (`maturecamrooms.com`)

1. Integra el código en **`main`** (merge PR).
2. Push a `main` → se dispara **Deploy to Cloudflare Pages** en GitHub.
3. El job usa `--branch=main` → actualiza el deployment **Production** enlazado al dominio.

Comprueba en GitHub → Actions que el último run en `main` termina en verde.

### 3. Desplegar ramas `cursor/**` (preview)

Push a la rama → el mismo workflow despliega con `--branch=<nombre-rama>` → URL `*.pages.dev` / alias de rama.

## Alternativa: seguir usando Cloudflare Git build

Si quieres que **Cloudflare** compile en cada push (no recomendado si ya usas Actions):

1. **Workers & Pages** → **maturecamrooms** → **Settings** → **Environment variables**.
2. Crea **CRAK_API_KEY** y **CRAK_TOKEN** (encrypted).
3. En cada variable, marca **Production** y **Preview**.
4. Opcional: `CRAK_CAM_API_BASE`, `CRAK_BRANDS`, `CRAK_LANDING_ID`.
5. **Redeploy** la rama que falla.

Los nombres deben ser exactos (`CRAK_API_KEY`, `CRAK_TOKEN`). Los bindings solo-runtime de Workers **no** cuentan para `npm run pages:build`.

## Qué no hacer

- No poner CRAK en `wrangler.toml` (queda en el repo).
- No usar `npm audit fix --force` por este error.
- No saltarse `generate:sitemap` en producción.

## Resumen

| Pipeline | CRAK en build | Estado típico |
|----------|----------------|---------------|
| **GitHub Actions** | Secrets del repo | ✅ Correcto si secrets configurados |
| **Cloudflare Git** | Variables del dashboard (Prod + Preview) | ❌ Falla si solo hay `NEXT_PUBLIC_*` en el log |

**Definitivo:** un pipeline (Actions) + desactivar build Git en Cloudflare, o duplicar CRAK en dashboard para Prod **y** Preview.
