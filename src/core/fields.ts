/** Spreads `{ [key]: value }` only when the value is present. */
export function optionalField<K extends string, V>(key: K, value: V | undefined): { [P in K]?: V } {
  return value === undefined ? {} : ({ [key]: value } as { [P in K]?: V });
}
