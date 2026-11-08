export const SANDBOX_URL: "https://api.sandbox.namecheap.com/xml.response";

export interface FixtureRequest {
  fixture: string;
  command: string;
  params?: Record<string, string>;
  allowError?: boolean;
}

export type Env = Record<string, string | undefined>;

export function readEnv(env: Env): { apiUser: string; apiKey: string; clientIp: string };

export function buildRequest(
  entry: FixtureRequest,
  env: Env,
): {
  url: string;
  init: {
    method: "POST";
    headers: { "Content-Type": "application/x-www-form-urlencoded" };
    body: string;
    redirect: "error";
  };
};

export function maskSecrets(text: string, env: Env): string;
export function resolveFixturePath(fixture: string, rootDir: string): string;
export function withSourceHeader(xml: string): string;

export interface MainDeps {
  argv?: string[];
  env?: Env;
  fetch?: typeof fetch;
  readFile?: (path: string) => Promise<string>;
  writeFile?: (path: string, content: string) => Promise<void>;
  log?: (line: string) => void;
  rootDir?: string;
}

export function main(deps?: MainDeps): Promise<number>;
