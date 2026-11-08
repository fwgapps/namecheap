import Namecheap from "../src/client";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** Reads `tests/fixtures/<group>/<command>.xml`. */
export function loadFixture(group: string, command: string): string {
  const path = join(here, "fixtures", group, `${command}.xml`);
  if (!existsSync(path))
    throw new Error(`Fixture not found: tests/fixtures/${group}/${command}.xml`);
  return readFileSync(path, "utf8");
}

export interface RecordedCall {
  url: string;
  method: string;
  headers: Headers;
  body: URLSearchParams;
}

/** A fake `fetch` that records every call and resolves `xml`. */
export function createFakeFetch(
  xml: string,
  init?: { status?: number },
): { fetch: typeof fetch; calls: RecordedCall[] } {
  const calls: RecordedCall[] = [];
  const fakeFetch = (input: RequestInfo | URL, reqInit?: RequestInit): Promise<Response> => {
    calls.push({
      url: String(input),
      method: reqInit?.method ?? "GET",
      headers: new Headers(reqInit?.headers),
      body: new URLSearchParams(String(reqInit?.body)),
    });
    return Promise.resolve(new Response(xml, { status: init?.status ?? 200 }));
  };
  return { fetch: fakeFetch as typeof fetch, calls };
}

/** A sandbox `Namecheap` client whose HTTP calls are answered with `xml`. */
export function createTestClient(
  xml: string,
  init?: { status?: number },
): { client: Namecheap; calls: RecordedCall[] } {
  const { fetch, calls } = createFakeFetch(xml, init);
  const client = new Namecheap({
    apiUser: "test-user",
    apiKey: "SECRET-KEY",
    clientIp: "127.0.0.1",
    sandbox: true,
    fetch,
  });
  return { client, calls };
}
