import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "public/data/catalog/all");
const p1 = JSON.parse(readFileSync(resolve(root, "page-1.json"), "utf8"));
const p3 = JSON.parse(readFileSync(resolve(root, "page-3.json"), "utf8"));
const overlap = p1.some((m) => p3.some((x) => x.id === m.id));
console.log(
  JSON.stringify(
    {
      page3Models: p3.length,
      page3FirstUsername: p3[0]?.username,
      page1FirstUsername: p1[0]?.username,
      distinctFromPage1: !overlap,
    },
    null,
    2,
  ),
);
