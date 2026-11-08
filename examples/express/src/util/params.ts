import type { Request } from "express";
import { BadRequestError } from "../middleware/errors";

type Query = Request["query"];

/** Required string query parameter. */
export function requiredString(query: Query, name: string): string {
  const value = query[name];
  if (typeof value !== "string" || value === "") {
    throw new BadRequestError(`Missing or invalid query parameter: ${name}`);
  }
  return value;
}

/**
 * Positive integer (ids, pages, years). Accepts a number or a plain decimal string:
 * no whitespace, hex, exponent or decimals.
 */
export function numericParam(value: unknown, name: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^[0-9]+$/.test(value)
        ? Number(value)
        : NaN;
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(`Missing or invalid parameter: ${name} (positive integer expected)`);
  }
  return parsed;
}

/**
 * Picks the listed string and number query parameters that are present.
 * Used for the optional filters of the list commands.
 */
export function pickQuery(
  query: Query,
  strings: readonly string[],
  numbers: readonly string[] = [],
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const name of strings) {
    const value = query[name];
    if (typeof value === "string" && value !== "") out[name] = value;
  }
  for (const name of numbers) {
    const value = query[name];
    if (typeof value === "string" && value !== "") out[name] = numericParam(value, name);
  }
  return out;
}

/** The JSON body as an object; rejects a missing, array or non-object body. */
export function bodyObject(req: Request): Record<string, unknown> {
  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new BadRequestError("Request body must be a JSON object");
  }
  return body as Record<string, unknown>;
}

/**
 * The JSON body typed as `T`, after checking that it is an object and that every
 * listed field is present (not undefined, null or an empty string) and of the right
 * kind: a string, number or boolean, except the fields named in `structured`, which
 * must be an array or an object (lists of records, contact blocks).
 */
export function bodyOf<T>(
  req: Request,
  required: readonly string[] = [],
  structured: readonly string[] = [],
): T {
  const body = bodyObject(req);
  for (const name of required) {
    const value = body[name];
    if (value === undefined || value === null || value === "") {
      throw new BadRequestError(`Missing body field: ${name}`);
    }
    const isStructured = typeof value === "object";
    const isPrimitive =
      typeof value === "string" || typeof value === "number" || typeof value === "boolean";
    if (structured.includes(name) ? !isStructured : !isPrimitive) {
      throw new BadRequestError(`Invalid body field: ${name}`);
    }
  }
  return body as T;
}

/** An optional boolean body field (`false` when absent); a present non-boolean is rejected. */
export function optionalBodyBoolean(req: Request, name: string): boolean {
  const value = bodyObject(req)[name];
  if (value === undefined) return false;
  if (typeof value !== "boolean") {
    throw new BadRequestError(`Invalid body field: ${name} (true or false expected)`);
  }
  return value;
}

/** A required non-empty string body field. */
export function bodyString(req: Request, name: string): string {
  const value = bodyObject(req)[name];
  if (typeof value !== "string" || value === "") {
    throw new BadRequestError(`Missing or invalid body field: ${name}`);
  }
  return value;
}

/** A required positive integer body field. */
export function bodyNumber(req: Request, name: string): number {
  return numericParam(bodyObject(req)[name], name);
}

/** A required non-empty array of plain objects. */
export function bodyObjectArray(req: Request, name: string, allowEmpty = false): void {
  const value = bodyObject(req)[name];
  const ok =
    Array.isArray(value) &&
    (allowEmpty || value.length > 0) &&
    value.every((item) => typeof item === "object" && item !== null && !Array.isArray(item));
  if (!ok) {
    throw new BadRequestError(
      `Body field ${name} must be ${allowEmpty ? "an" : "a non-empty"} array of objects`,
    );
  }
}

/** An optional string body field; present but not a non-empty string is rejected. */
export function optionalBodyString(req: Request, name: string): string | undefined {
  const value = bodyObject(req)[name];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value === "") {
    throw new BadRequestError(`Invalid body field: ${name}`);
  }
  return value;
}
