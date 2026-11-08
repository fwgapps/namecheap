import { NamecheapParseError } from "./errors";

export interface XmlNode {
  readonly name: string;
  readonly attrs: Readonly<Record<string, string>>;
  readonly text: string;
  readonly children: readonly XmlNode[];
}

interface Builder {
  name: string;
  attrs: Record<string, string>;
  text: string;
  children: XmlNode[];
}

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

const NAME_START = /[A-Za-z_:]/;
const NAME_CHAR = /[A-Za-z0-9_:.-]/;

function fail(message: string, position: number): never {
  throw new NamecheapParseError(`Invalid XML at position ${position}: ${message}`);
}

function isSpace(ch: string | undefined): boolean {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

function decodeEntities(raw: string, position: number): string {
  if (!raw.includes("&")) return raw;
  let out = "";
  let i = 0;
  while (i < raw.length) {
    const amp = raw.indexOf("&", i);
    if (amp === -1) {
      out += raw.slice(i);
      break;
    }
    out += raw.slice(i, amp);
    const semi = raw.indexOf(";", amp);
    if (semi === -1) fail("unterminated entity", position + amp);
    const body = raw.slice(amp + 1, semi);
    let decoded: string | undefined;
    if (body.startsWith("#x") || body.startsWith("#X")) {
      decoded = codePoint(body.slice(2), 16);
    } else if (body.startsWith("#")) {
      decoded = codePoint(body.slice(1), 10);
    } else {
      decoded = Object.hasOwn(NAMED_ENTITIES, body) ? NAMED_ENTITIES[body] : undefined;
    }
    if (decoded === undefined) {
      const shown = body.length > 32 ? `${body.slice(0, 32)}…` : body;
      fail(`unknown entity &${shown};`, position + amp);
    }
    out += decoded;
    i = semi + 1;
  }
  return out;
}

function codePoint(digits: string, radix: 10 | 16): string | undefined {
  const pattern = radix === 10 ? /^[0-9]{1,7}$/ : /^[0-9A-Fa-f]{1,6}$/;
  if (!pattern.test(digits)) return undefined;
  const value = Number.parseInt(digits, radix);
  if (value > 0x10ffff || (value >= 0xd800 && value <= 0xdfff)) return undefined;
  return String.fromCodePoint(value);
}

/**
 * Parses an XML document and returns its root element.
 *
 * Supports elements, attributes, text, CDATA, comments, processing instructions and the five
 * predefined entities plus numeric character references. DTDs and custom entities are rejected.
 */
export function parseXml(input: string): XmlNode {
  const length = input.length;
  let pos = 0;
  let root: XmlNode | undefined;
  const stack: Builder[] = [];

  const skipSpace = (): void => {
    while (pos < length && isSpace(input[pos])) pos++;
  };

  const readName = (): string => {
    const start = pos;
    if (pos >= length || !NAME_START.test(input[pos] as string)) fail("expected a name", pos);
    pos++;
    while (pos < length && NAME_CHAR.test(input[pos] as string)) pos++;
    return input.slice(start, pos);
  };

  const skipUntil = (terminator: string, what: string): void => {
    const end = input.indexOf(terminator, pos);
    if (end === -1) fail(`unterminated ${what}`, pos);
    pos = end + terminator.length;
  };

  const readAttributes = (attrs: Record<string, string>): boolean => {
    for (;;) {
      const before = pos;
      skipSpace();
      const ch = input[pos];
      if (ch === undefined) fail("unterminated start tag", pos);
      if (ch === ">") {
        pos++;
        return false;
      }
      if (ch === "/") {
        if (input[pos + 1] !== ">") fail("expected '>' after '/'", pos);
        pos += 2;
        return true;
      }
      if (pos === before) fail("expected whitespace before attribute", pos);
      const name = readName();
      skipSpace();
      if (input[pos] !== "=") fail(`attribute ${name} has no value`, pos);
      pos++;
      skipSpace();
      const quote = input[pos];
      if (quote !== '"' && quote !== "'") fail(`attribute ${name} value is not quoted`, pos);
      pos++;
      const end = input.indexOf(quote, pos);
      if (end === -1) fail("unterminated attribute value", pos);
      const raw = input.slice(pos, end);
      if (raw.includes("<")) fail("'<' in attribute value", pos);
      if (Object.hasOwn(attrs, name)) fail(`duplicate attribute ${name}`, pos);
      attrs[name] = decodeEntities(raw, pos);
      pos = end + 1;
    }
  };

  const closeElement = (builder: Builder): void => {
    const node: XmlNode = {
      name: builder.name,
      attrs: builder.attrs,
      text: builder.text.trim(),
      children: builder.children,
    };
    const parent = stack[stack.length - 1];
    if (parent) parent.children.push(node);
    else root = node;
  };

  while (pos < length) {
    const current = stack[stack.length - 1];

    if (input[pos] !== "<") {
      const next = input.indexOf("<", pos);
      const end = next === -1 ? length : next;
      const raw = input.slice(pos, end);
      if (current) {
        current.text += decodeEntities(raw, pos);
      } else if (raw.trim() !== "") {
        fail("text outside the root element", pos);
      }
      pos = end;
      continue;
    }

    if (input.startsWith("<!--", pos)) {
      pos += 4;
      skipUntil("-->", "comment");
    } else if (input.startsWith("<![CDATA[", pos)) {
      if (!current) fail("CDATA outside the root element", pos);
      pos += 9;
      const end = input.indexOf("]]>", pos);
      if (end === -1) fail("unterminated CDATA section", pos);
      current.text += input.slice(pos, end);
      pos = end + 3;
    } else if (input.startsWith("<?", pos)) {
      pos += 2;
      skipUntil("?>", "processing instruction");
    } else if (input.startsWith("<!", pos)) {
      fail("DTD and entity declarations are not supported", pos);
    } else if (input.startsWith("</", pos)) {
      pos += 2;
      const name = readName();
      skipSpace();
      if (input[pos] !== ">") fail("expected '>' in end tag", pos);
      pos++;
      if (!current) fail(`unexpected end tag </${name}>`, pos);
      if (current.name !== name) {
        fail(`end tag </${name}> does not match <${current.name}>`, pos);
      }
      stack.pop();
      closeElement(current);
    } else {
      if (!current && root) fail("more than one root element", pos);
      pos++;
      const builder: Builder = { name: readName(), attrs: {}, text: "", children: [] };
      const selfClosing = readAttributes(builder.attrs);
      if (selfClosing) closeElement(builder);
      else stack.push(builder);
    }
  }

  if (stack.length > 0) fail(`unclosed element <${stack[stack.length - 1]?.name}>`, pos);
  if (!root) fail("no root element", pos);
  return root;
}
