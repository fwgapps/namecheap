import { El } from "./element";
import { NamecheapError, NamecheapParseError, type ApiErrorItem } from "./errors";
import { parseXml } from "./xml";

const INTEGER = /^-?\d+$/;

function toErrorItem(error: El): ApiErrorItem {
  const number = error.optionalString("Number")?.trim();
  return {
    code: number !== undefined && INTEGER.test(number) ? Number(number) : -1,
    message: error.text().trim(),
  };
}

/**
 * Parses a Namecheap response body and returns its `CommandResponse` element.
 * Throws `NamecheapError` for API errors and `NamecheapParseError` for malformed envelopes.
 */
export function readEnvelope(xml: string): El {
  // The sandbox can prepend a PHP warning (HTML) before the XML, e.g. on ssl.parseCSR.
  const start = xml.search(/<\?xml|<ApiResponse/);
  const root = new El(parseXml(start > 0 ? xml.slice(start) : xml));
  if (root.name !== "ApiResponse") {
    throw new NamecheapParseError(`Unexpected response root element "${root.name}"`);
  }
  const errors = root.optional("Errors")?.all("Error") ?? [];
  if (root.optionalString("Status") === "ERROR" || errors.length > 0) {
    throw new NamecheapError(errors.map(toErrorItem));
  }
  const command = root.optional("CommandResponse");
  if (command === undefined) {
    throw new NamecheapParseError("Response has no CommandResponse element");
  }
  return command;
}
