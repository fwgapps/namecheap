#!/usr/bin/env node
// Records real Namecheap SANDBOX responses as XML test fixtures.
//
// Usage:
//   NAMECHEAP_API_USER=... NAMECHEAP_API_KEY=... NAMECHEAP_CLIENT_IP=... \
//     node scripts/record-fixtures.mjs scripts/fixture-requests.example.json
//
// The host is a constant (the sandbox); it cannot be changed by flag or env var.
// Zero dependencies, Node >= 20.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SANDBOX_URL = "https://api.sandbox.namecheap.com/xml.response";

const SOURCE_HEADER = "<!-- source: sandbox -->";
const FIXTURE_PATTERN = /^[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/;
const REQUIRED_ENV = ["NAMECHEAP_API_USER", "NAMECHEAP_API_KEY", "NAMECHEAP_CLIENT_IP"];

/**
 * Reads the credentials from the environment. Errors name the missing variable and never
 * include any value.
 */
export function readEnv(env) {
  for (const name of REQUIRED_ENV) {
    if (typeof env[name] !== "string" || env[name] === "") {
      throw new Error(`Missing required environment variable ${name}`);
    }
  }
  return {
    apiUser: env.NAMECHEAP_API_USER,
    apiKey: env.NAMECHEAP_API_KEY,
    clientIp: env.NAMECHEAP_CLIENT_IP,
  };
}

/** Builds the sandbox request: a form-encoded POST, like the library sends. */
export function buildRequest(entry, env) {
  const { apiUser, apiKey, clientIp } = readEnv(env);
  const body = new URLSearchParams();
  body.append("ApiUser", apiUser);
  body.append("ApiKey", apiKey);
  body.append("UserName", apiUser);
  body.append("ClientIp", clientIp);
  body.append("Command", entry.command);
  for (const [name, value] of Object.entries(entry.params ?? {})) body.append(name, value);
  return {
    url: SANDBOX_URL,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      redirect: "error",
    },
  };
}

/** Replaces every occurrence of the API key (raw and form-encoded) with `***`. */
export function maskSecrets(text, env) {
  const key = env.NAMECHEAP_API_KEY;
  if (typeof key !== "string" || key === "") return text;
  let out = text.split(key).join("***");
  const encoded = new URLSearchParams({ k: key }).toString().slice(2);
  if (encoded !== key) out = out.split(encoded).join("***");
  return out;
}

/** Maps `group/name` to `<rootDir>/tests/fixtures/group/name.xml`, rejecting anything else. */
export function resolveFixturePath(fixture, rootDir) {
  if (typeof fixture !== "string" || !FIXTURE_PATTERN.test(fixture)) {
    throw new Error(`Invalid fixture name ${JSON.stringify(fixture)}: expected "group/name"`);
  }
  const [group, name] = fixture.split("/");
  if (name === "." || name === ".." || group === "") {
    throw new Error(`Invalid fixture name ${JSON.stringify(fixture)}: expected "group/name"`);
  }
  return `${rootDir}/tests/fixtures/${group}/${name}.xml`;
}

/** Makes `<!-- source: sandbox -->` the first line, dropping any leading source comments. */
export function withSourceHeader(xml) {
  const rest = xml.replace(/^(?:\s*<!--\s*source:[^]*?-->[ \t]*\r?\n?)+/, "");
  return `${SOURCE_HEADER}\n${rest.replace(/^\s*\n/, "")}`;
}

function validateEntries(entries) {
  if (!Array.isArray(entries)) throw new Error("Requests file must contain a JSON array");
  entries.forEach((entry, index) => {
    const where = `Entry ${index}`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`${where}: must be an object`);
    }
    resolveFixturePath(entry.fixture, "");
    if (typeof entry.command !== "string" || entry.command === "") {
      throw new Error(`${where}: "command" must be a non-empty string`);
    }
    if (entry.params !== undefined) {
      const p = entry.params;
      if (p === null || typeof p !== "object" || Array.isArray(p)) {
        throw new Error(`${where}: "params" must be an object of string values`);
      }
      for (const [name, value] of Object.entries(p)) {
        if (typeof value !== "string") {
          throw new Error(`${where}: param ${name} must be a string`);
        }
      }
    }
    if (entry.allowError !== undefined && typeof entry.allowError !== "boolean") {
      throw new Error(`${where}: "allowError" must be a boolean`);
    }
  });
  return entries;
}

const defaultRootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function defaultWriteFile(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

/** Runs the recorder. Returns the process exit code. */
export async function main({
  argv = process.argv,
  env = process.env,
  fetch: fetchImpl = globalThis.fetch,
  readFile: read = (path) => readFile(path, "utf8"),
  writeFile: write = defaultWriteFile,
  log = console.log,
  rootDir = defaultRootDir,
} = {}) {
  const requestsPath = argv[2];
  if (requestsPath === undefined) {
    throw new Error("Usage: node scripts/record-fixtures.mjs <requests.json>");
  }
  readEnv(env);
  const entries = validateEntries(JSON.parse(await read(requestsPath)));
  const targets = entries.map((entry) => resolveFixturePath(entry.fixture, rootDir));

  let failures = 0;
  for (const [index, entry] of entries.entries()) {
    const label = entry.fixture;
    try {
      const { url, init } = buildRequest(entry, env);
      const response = await fetchImpl(url, init);
      const text = await response.text();
      const status = /<ApiResponse[^>]*\sStatus="([^"]*)"/.exec(text)?.[1] ?? "unknown";
      const failed = !response.ok || status === "ERROR";
      const summary = `HTTP ${response.status}, Status ${status}`;
      if (failed && entry.allowError !== true) {
        failures += 1;
        log(
          maskSecrets(`${label}: skipped (${summary}); set "allowError": true to record it`, env),
        );
        continue;
      }
      await write(targets[index], maskSecrets(withSourceHeader(text), env));
      log(maskSecrets(`${label}: written (${summary})`, env));
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : String(error);
      log(maskSecrets(`${label}: failed (${message})`, env));
    }
  }
  log("Review the recorded XML for personal data (names, emails, addresses) before committing.");
  return failures > 0 ? 1 : 0;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(
        maskSecrets(error instanceof Error ? error.message : String(error), process.env),
      );
      process.exitCode = 1;
    },
  );
}
