export function normalizeStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const rawValues = Array.isArray(value) ? value : [value];
  const normalizedValues = rawValues
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);

  return normalizedValues.length > 0 ? normalizedValues : undefined;
}

export function normalizeNumberArray(value: unknown): number[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const rawValues = Array.isArray(value) ? value : [value];
  const normalizedValues = rawValues
    .map((item) => Number(item))
    .filter((item) => !isNaN(item) && Number.isInteger(item) && item > 0);

  return normalizedValues.length > 0 ? normalizedValues : undefined;
}
