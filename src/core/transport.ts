import type { El } from "./element";
import { readEnvelope } from "./envelope";
import { NamecheapHttpError } from "./errors";

export interface TransportConfig {
  apiUser: string;
  apiKey: string;
  userName?: string;
  clientIp: string;
  sandbox?: boolean;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

export interface CommandRequest {
  command: string;
  params: Array<[string, string]>;
}

export type Send = (req: CommandRequest) => Promise<El>;

const PRODUCTION_URL = "https://api.namecheap.com/xml.response";
const SANDBOX_URL = "https://api.sandbox.namecheap.com/xml.response";

/**
 * Creates the function that sends one command as a form-encoded POST and returns the
 * `CommandResponse` element. Error messages are fixed strings: they never contain the
 * URL, the API key, the request body or the response body.
 */
export function createTransport(config: TransportConfig): Send {
  const url = config.sandbox === true ? SANDBOX_URL : PRODUCTION_URL;
  const fetchImpl = config.fetch ?? globalThis.fetch;

  return async ({ command, params }) => {
    const body = new URLSearchParams();
    body.append("ApiUser", config.apiUser);
    body.append("ApiKey", config.apiKey);
    body.append("UserName", config.userName ?? config.apiUser);
    body.append("ClientIp", config.clientIp);
    body.append("Command", command);
    for (const [name, value] of params) body.append(name, value);

    const init: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    };
    if (config.timeoutMs !== undefined) init.signal = AbortSignal.timeout(config.timeoutMs);

    let response: Response;
    try {
      response = await fetchImpl(url, init);
    } catch (cause) {
      throw new NamecheapHttpError("Request to Namecheap failed", { cause });
    }

    if (!response.ok) {
      throw new NamecheapHttpError(`Namecheap responded with HTTP ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    let text: string;
    try {
      text = await response.text();
    } catch (cause) {
      throw new NamecheapHttpError("Request to Namecheap failed", { cause });
    }
    return readEnvelope(text);
  };
}
