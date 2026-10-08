const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  AU: "Australia",
  BR: "Brazil",
  CO: "Colombia",
};

export function countryCodeToFlag(code?: string): string {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...[...upper].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
  );
}

export function countryLabel(code?: string, name?: string): string {
  if (name) return name;
  if (!code) return "";
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}
