import { CATEGORY_DISPLAY, SITE_CATEGORIES, type SiteCategory } from "@/lib/seo/config";
import { categoryPath, countryPath, modelProfilePath } from "@/lib/seo/slug";
import { countryLabel } from "@/lib/country";
import { slugify } from "@/lib/seo/slug";
import type { CamModel } from "@/lib/models/types";

export type BreadcrumbItem = {
  name: string;
  href: string;
};

export function generateHomeBreadcrumb(): BreadcrumbItem {
  return { name: "Home", href: "/" };
}

export function generateModelBreadcrumbs(
  model: CamModel,
  options?: { categoryIndexable?: boolean; countryIndexable?: boolean },
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [generateHomeBreadcrumb()];

  const cat = model.primaryCategory?.toLowerCase();
  if (
    cat &&
    (SITE_CATEGORIES as readonly string[]).includes(cat) &&
    options?.categoryIndexable !== false
  ) {
    items.push({
      name: CATEGORY_DISPLAY[cat as SiteCategory],
      href: categoryPath(cat),
    });
  }

  const country = countryLabel(model.countryCode, model.country);
  if (country && options?.countryIndexable) {
    items.push({
      name: country,
      href: countryPath(slugify(country)),
    });
  }

  items.push({
    name: model.displayName.trim(),
    href: modelProfilePath(model.username),
  });

  return items;
}

export function generateTaxonomyBreadcrumbs(
  label: string,
  href: string,
): BreadcrumbItem[] {
  return [
    generateHomeBreadcrumb(),
    { name: label, href },
  ];
}
