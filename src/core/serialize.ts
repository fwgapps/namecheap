export const ACRONYMS: readonly string[] = [
  "SLD",
  "TLD",
  "IP",
  "ID",
  "DNS",
  "WG",
  "MX",
  "TTL",
  "EPP",
  "CSR",
  "DCV",
  "SSL",
];

export type ArrayStyle = "bracket" | "suffix";

export interface SerializeOptions {
  arrayStyle?: ArrayStyle;
  /** Maps a dotted camelCase path (e.g. `registrant.firstName`) to an exact parameter name. */
  keys?: Readonly<Record<string, string>>;
}

const hasOwn = (obj: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

function splitWords(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_]+/)
    .filter((word) => word.length > 0);
}

function toWord(word: string): string {
  const upper = word.toUpperCase();
  if (ACRONYMS.includes(upper)) return upper;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function toParamName(key: string): string {
  return splitWords(key).map(toWord).join("");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

export function serializeParams(
  params: object,
  opts: SerializeOptions = {},
): Array<[string, string]> {
  const arrayStyle = opts.arrayStyle ?? "bracket";
  const keys = opts.keys ?? {};
  const out: Array<[string, string]> = [];

  const walk = (obj: object, path: string[], prefix: string): void => {
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;
      const keyPath = [...path, key];
      const dotted = keyPath.join(".");
      const name = (hasOwn(keys, dotted) ? keys[dotted] : undefined) ?? prefix + toParamName(key);

      if (Array.isArray(value)) {
        if (value.some((item) => isPlainObject(item))) {
          // Records: element i (1-based, by position) field f becomes `<Field><i>`; the
          // array's own name is not part of the wire name.
          value.forEach((item, position) => {
            if (item === undefined || item === null) {
              throw new TypeError(
                `Array parameter "${dotted}" cannot contain null or undefined records`,
              );
            }
            if (!isPlainObject(item)) {
              throw new TypeError(`Array parameter "${dotted}" cannot mix objects and scalars`);
            }
            for (const [field, fieldValue] of Object.entries(item)) {
              if (fieldValue === undefined || fieldValue === null) continue;
              if (isObject(fieldValue)) {
                throw new TypeError(
                  `Array parameter "${dotted}" field "${field}" must be a scalar value`,
                );
              }
              out.push([`${toParamName(field)}${position + 1}`, String(fieldValue)]);
            }
          });
          continue;
        }
        let index = 0;
        for (const item of value) {
          if (item === undefined || item === null) continue;
          if (isObject(item)) {
            throw new TypeError(
              `Array parameter "${dotted}" cannot contain nested arrays or non-plain objects`,
            );
          }
          index += 1;
          out.push([
            arrayStyle === "bracket" ? `${name}[${index}]` : `${name}${index}`,
            String(item),
          ]);
        }
      } else if (isObject(value)) {
        // A mapped parent name replaces the concatenated prefix for its children.
        walk(value, keyPath, name);
      } else {
        out.push([name, String(value)]);
      }
    }
  };

  walk(params, [], "");
  return out;
}
