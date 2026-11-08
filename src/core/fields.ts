import type { El } from "./element";

/** Spreads `{ [key]: value }` only when the value is present. */
export function optionalField<K extends string, V>(key: K, value: V | undefined): { [P in K]?: V } {
  return value === undefined ? {} : ({ [key]: value } as { [P in K]?: V });
}

/**
 * The lenient number of the first of `names` that is present on `el` (a present but
 * malformed value yields `undefined`, never a throw). For response attributes whose
 * spelling varies, such as `OrderId` and `OrderID`.
 */
export function firstLenientNumber(el: El, ...names: string[]): number | undefined {
  for (const name of names) {
    if (el.optionalString(name) !== undefined) return el.lenientNumber(name);
  }
  return undefined;
}
