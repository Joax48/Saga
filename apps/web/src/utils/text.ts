/**
 * Converts an arbitrary string to Title Case: lowercases everything and then
 * capitalizes the first letter of each space-separated word.
 *
 * Useful for values that arrive from the backend in ALL CAPS (e.g. the CEA
 * researcher category) so they render as "Investigador Asociado" instead of
 * "INVESTIGADOR ASOCIADO".
 */
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/**
 * Title-cases a CEA category value, tolerating null/undefined/blank input by
 * returning the value unchanged (callers handle the empty state themselves).
 */
export function formatCeaCategory<T extends string | null | undefined>(value: T): T {
  if (!value || !value.trim()) return value;
  return toTitleCase(value) as T;
}
