import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "public/data/catalog");
const p1 = JSON.parse(readFileSync(resolve(root, "all/page-1.json"), "utf8"));
const p3 = JSON.parse(readFileSync(resolve(root, "all/page-3.json"), "utf8"));
const overlap = p1.some((m) => p3.some((x) => x.id === m.id));
console.log(
  JSON.stringify(
    {
      page1First: p1[0]?.username,
      page3First: p3[0]?.username,
      page3Count: p3.length,
      overlapsPage1: overlap,
      page3Range: `models ${(3 - 1) * 48 + 1}-${(3 - 1) * 48 + p3.length}`,
    },
    null,
    2,
  ),
);
