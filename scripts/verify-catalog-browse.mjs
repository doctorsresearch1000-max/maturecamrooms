import { getFullCatalog, pageCatalog, sortCatalogBrowse } from "../src/lib/crak/fullCatalog.ts";
import { buildCatalogMenuInventory } from "../src/lib/taxonomy/catalogInventory.ts";

const { models } = await getFullCatalog();
const menu = buildCatalogMenuInventory(models, models.length > 0);
let accumulated = 0;
for (let page = 1; page <= 5; page++) {
  const p = pageCatalog(sortCatalogBrowse(models), page, 48);
  accumulated += p.models.length;
}
console.log(
  JSON.stringify(
    {
      catalogModels: models.length,
      fivePagesAccumulated: accumulated,
      menuFacets: {
        niches: menu.niches,
        ageBands: menu.ageBands,
        countries: menu.countries.length,
        ethnicities: menu.ethnicities.length,
        hairs: menu.hairs.length,
        busts: menu.busts.length,
        figures: menu.figures.length,
        languages: menu.languages.length,
      },
    },
    null,
    2,
  ),
);
