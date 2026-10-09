import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const menuPath = resolve(process.cwd(), "public/data/catalog/menu.json");
const menu = JSON.parse(readFileSync(menuPath, "utf8"));
console.log(
  JSON.stringify(
    {
      catalogCount: menu.catalogCount,
      nicheReport: menu.nicheReport,
    },
    null,
    2,
  ),
);
