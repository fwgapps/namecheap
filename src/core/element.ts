import { NamecheapParseError } from "./errors";
import type { XmlNode } from "./xml";

const PLAIN_DECIMAL = /^[+-]?\d+(\.\d+)?$/;

/** Typed, read-only view over an XML node. Error messages never include attribute values. */
export class El {
  readonly name: string;

  constructor(private readonly node: XmlNode) {
    this.name = node.name;
  }

  text(): string {
    return this.node.text;
  }

  all(name: string): El[] {
    return this.node.children.filter((child) => child.name === name).map((child) => new El(child));
  }

  /** All direct child elements in document order, whatever their names. */
  children(): El[] {
    return this.node.children.map((child) => new El(child));
  }

  one(name: string): El {
    const found = this.optional(name);
    if (found === undefined) {
      throw new NamecheapParseError(`${this.name}: missing element "${name}"`);
    }
    return found;
  }

  optional(name: string): El | undefined {
    const child = this.node.children.find((candidate) => candidate.name === name);
    return child === undefined ? undefined : new El(child);
  }

  string(attr: string): string {
    const value = this.optionalString(attr);
    if (value === undefined) {
      throw new NamecheapParseError(`${this.name}: missing attribute "${attr}"`);
    }
    return value;
  }

  optionalString(attr: string): string | undefined {
    return Object.hasOwn(this.node.attrs, attr) ? this.node.attrs[attr] : undefined;
  }

  number(attr: string): number {
    return this.parseNumber(attr, this.string(attr));
  }

  optionalNumber(attr: string): number | undefined {
    const value = this.optionalString(attr);
    return value === undefined ? undefined : this.parseNumber(attr, value);
  }

  boolean(attr: string): boolean {
    return this.parseBoolean(attr, this.string(attr));
  }

  optionalBoolean(attr: string): boolean | undefined {
    const value = this.optionalString(attr);
    return value === undefined ? undefined : this.parseBoolean(attr, value);
  }

  /** Element text as a plain decimal number (for numeric child elements). */
  numberText(): number {
    return this.parseNumber(`text`, this.text(), `${this.name}: text is not a number`);
  }

  /** Element text as `true`/`false` (for boolean child elements). */
  booleanText(): boolean {
    return this.parseBoolean(`text`, this.text(), `${this.name}: text is not a boolean`);
  }

  attributes(): Record<string, string> {
    return { ...this.node.attrs };
  }

  private parseNumber(attr: string, value: string, message?: string): number {
    const parsed = PLAIN_DECIMAL.test(value) ? Number(value) : Number.NaN;
    if (!Number.isFinite(parsed)) {
      throw new NamecheapParseError(message ?? `${this.name}: attribute "${attr}" is not a number`);
    }
    return parsed;
  }

  private parseBoolean(attr: string, value: string, message?: string): boolean {
    const lower = value.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
    throw new NamecheapParseError(message ?? `${this.name}: attribute "${attr}" is not a boolean`);
  }
}
