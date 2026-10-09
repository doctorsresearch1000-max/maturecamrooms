import Link from "next/link";
import { getTaxonomyMenuPayload } from "@/lib/taxonomy/menuPayload";

/** Server-rendered facet links for crawlers (parity across viewports). */
export async function TaxonomyCrawlNav() {
  const menu = await getTaxonomyMenuPayload();
  const groups: { title: string; items: { href: string; label: string }[] }[] =
    [
      { title: "Niche", items: menu.categories },
      { title: "Age", items: menu.ageBands },
      { title: "Ethnicity", items: menu.ethnicities },
      { title: "Hair", items: menu.hairs },
      { title: "Bust", items: menu.busts },
      { title: "Figure", items: menu.figures },
      { title: "Countries", items: menu.countries },
      { title: "Languages", items: menu.languages },
    ];

  return (
    <nav
      className="sr-only"
      aria-label="Browse categories and facets"
      data-taxonomy-crawl-nav
    >
      {groups.map((group) =>
        group.items.length > 0 ? (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </nav>
  );
}
