/**
 * Documents /model/[slug] data path and samples an offline-looking URL from sitemap shard 2.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const shard2 = resolve(process.cwd(), "public/sitemap-models-2.xml");
const xml = readFileSync(shard2, "utf8");
const urls = [...xml.matchAll(/<loc>([^<]+\/model\/([^<]+))<\/loc>/g)].map(
  (m) => ({ url: m[1], username: m[2] }),
);
const pick = urls[Math.floor(urls.length / 2)] ?? urls[0];

console.log(
  JSON.stringify(
    {
      route: "/model/[username]",
      dataSource:
        "CRAK API per request: getModelByUsername → getCrakPerformerBySlug → fetchPerformerByName (withCache). Not catalog snapshot.",
      relatedSource:
        "getRelatedModels → getCrakFeed (1 live list call, cached) + rankRelatedModels",
      expectedSubrequestsPerProfilePage:
        "~2 CRAK HTTP calls when cache cold (profile by name + related feed); 0 static catalog reads",
      sampleFromSitemapShard2: pick,
    },
    null,
    2,
  ),
);
