/**
 * Resolve UI text. Today: plain string.
 * Later: { en, fr } with a locale arg.
 */
export function t(value, locale = "en") {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? value.en ?? Object.values(value)[0] ?? "";
}
