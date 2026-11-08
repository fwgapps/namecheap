# @fwgapps/namecheap 1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `@fwgapps/namecheap` from scratch as a zero-dependency, fully typed Namecheap XML API client, released as 1.0.0.

**Architecture:** A small `core/` (XML parser, element reader, param serializer, envelope check, transport, `defineCommand`/`group`) that knows no specific command, plus `commands/<group>.ts` files that hold only declarative command definitions with their param/result types. Every command is covered by a contract test that runs a fixture XML through a fake `fetch`.

**Tech Stack:** TypeScript 5.x, Node >= 20 (`fetch`, `AbortSignal.timeout`), `tsup` (ESM + CJS + `.d.ts`), Vitest, ESLint, Prettier, Yarn classic, semantic-release.

**Spec:** `docs/superpowers/specs/2026-11-08-namecheap-v1-design.md`

## Global Constraints

- Branch: `claude/trusting-einstein-vizfy8`. Everything in the repository (code, comments, docs, commit messages, fixtures) is written in English.
- `package.json`: `engines.node` is `>=20`, no `dependencies` at all, `files: ["dist"]`, `sideEffects: false`, an `exports` map with `types`, `import` and `require`.
- Build output is ESM, CJS and `.d.ts` only. No IIFE build, no `unpkg`/`jsdelivr` fields, no browser support.
- No `@fwg/...` path aliases: relative imports only.
- The parser never coerces values; commands read fields with `string`/`number`/`boolean` accessors.
- No automatic retries anywhere.
- No DTD or external entity support in the XML parser.
- Command names, parameter names and response fields enter the code only after they are checked against the sources in spec section 6: the Go SDK reference `docs/namecheap-api-v2.md` (clone: `git clone --depth 1 https://github.com/fwgapps/go-namecheap-sdk`), its fixtures in `namecheaptest/fixtures/`, or a recorded sandbox response. The 0.6 source (`git show 2cb5f7f:src/<path>`) is a hint only.
- Every command is sent as an HTTP POST with an `application/x-www-form-urlencoded` body; the URL has no query string and the API key never appears in it.
- Every fixture's first line is a comment: `<!-- source: go-namecheap-sdk -->`, `<!-- source: docs -->` or `<!-- source: sandbox -->`.
- `NOTICE` credits the fixtures copied from `namecheap/go-namecheap-sdk` (Apache-2.0).
- The final rewrite commit carries a `BREAKING CHANGE:` footer so semantic-release goes from 0.6.0 to 1.0.0. Nothing is published to npm unless the maintainer asks.
- Public client properties: `domains`, `dns`, `ns`, `transfer`, `ssl`, `users`, `usersAddress`, `whoisGuard`.

## Review Focus

- A list command with zero results (empty `CommandResponse`) returns an empty array and never throws. Pinned in Task 10.
- The API key never appears in any error message, `cause` text, stack-visible string or URL; it is sent only in the POST body. Pinned in Task 7.
- A 2xx response whose body is not Namecheap XML (an HTML gateway or challenge page, an empty body) raises `NamecheapParseError`, never a raw `TypeError`. Pinned in Tasks 3 and 6.
- Several `<Error>` elements, or an error whose `Number` is not numeric, produce a `NamecheapError` that keeps all of them (`code` is `-1` when unparsable). Pinned in Task 6.
- Numeric-looking text such as `007` or `00123` read as a string stays intact. Pinned in Task 4.

## File Structure

```
src/index.ts                   public exports
src/client.ts                  Namecheap class
src/core/errors.ts             NamecheapError, NamecheapHttpError, NamecheapParseError
src/core/xml.ts                parseXml -> XmlNode
src/core/element.ts            El: typed reader over XmlNode
src/core/serialize.ts          params -> [name, value] pairs
src/core/envelope.ts           readEnvelope: Status/Errors handling
src/core/transport.ts          createTransport: URL, fetch, timeout
src/core/define.ts             defineCommand, group
src/commands/<group>.ts        one file per group (8 files)
tests/helpers.ts               createTestClient, loadFixture
tests/fixtures/<group>/*.xml
tests/core/*.test.ts, tests/<group>.test.ts
scripts/record-fixtures.mjs    sandbox recorder
```

---

### Task 1: Reset the repository scaffold

**Files:**
- Delete: `src/`, `tests/`, `.github/workflows/publish.yml` stays for Task 20
- Modify: `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`
- Create: `src/index.ts` (empty export placeholder: `export {};`)

**Interfaces:**
- Produces: working `yarn lint`, `yarn tsc --noEmit`, `yarn test`, `yarn build` on an empty project.

- [ ] **Step 1:** `git rm -r src tests`, then create `src/index.ts` containing `export {};` and `tests/smoke.test.ts` asserting `expect(1 + 1).toBe(2)`.
- [ ] **Step 2:** Edit `package.json`: remove `dependencies`, `unpkg`, `jsdelivr`, `ts-node`, `ts-node-dev`, `vite-tsconfig-paths`, `change-case-all`, `fast-xml-parser`; set `engines.node` to `>=20`, add `sideEffects: false`, `exports` (`{".": {"types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs"}}`), `typecheck` script `tsc --noEmit`, and run `yarn install` to refresh `yarn.lock`.
- [ ] **Step 3:** `tsconfig.json`: `target ES2022`, `module ESNext`, `moduleResolution Bundler`, `strict`, `noUncheckedIndexedAccess`, no `paths`/`baseUrl`, `include` only `src`, `tests`, `scripts`. `tsup.config.ts`: `format: ["esm", "cjs"]`, `dts: true`, `sourcemap: true`, `clean: true`, `target: "node20"`, no `minify`, no `globalName`. `vitest.config.ts`: drop `tsconfigPaths`, keep `globals: true`, coverage v8 with thresholds `lines 95, functions 95, statements 95, branches 90`, excluding `examples/**`, `dist`, `scripts`.
- [ ] **Step 4:** Run `yarn lint && yarn typecheck && yarn test --run && yarn build`. Expected: all exit 0 and `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts` exist.
- [ ] **Step 5:** `git add -A && git commit -m "chore: reset scaffold for the 1.0 rewrite"`

### Task 2: Error classes

**Files:** Create `src/core/errors.ts`, `tests/core/errors.test.ts`

**Interfaces:**
- Produces:
  - `type ApiErrorItem = { code: number; message: string }`
  - `class NamecheapError extends Error { readonly code: number; readonly errors: readonly ApiErrorItem[]; constructor(errors: readonly ApiErrorItem[]) }` (message = first error's message; `code` = first error's code; `name = "NamecheapError"`)
  - `class NamecheapHttpError extends Error { readonly status: number | undefined; readonly statusText: string; constructor(message: string, init?: { status?: number; statusText?: string; cause?: unknown }) }`
  - `class NamecheapParseError extends Error { constructor(message: string, init?: { cause?: unknown }) }`

- [ ] **Step 1: Write failing tests** in `tests/core/errors.test.ts`: `new NamecheapError([{code: 1011102, message: "API Key is invalid"}, {code: 5, message: "second"}])` is `instanceof Error`, has `name "NamecheapError"`, `code 1011102`, `message "API Key is invalid"`, `errors` of length 2; `new NamecheapHttpError("boom", {status: 502, statusText: "Bad Gateway"})` keeps `status 502` and `name "NamecheapHttpError"`, and with no init has `status undefined` and `statusText ""`; `NamecheapParseError` keeps `cause` and has `name "NamecheapParseError"`.
- [ ] **Step 2:** Run `yarn vitest run tests/core/errors.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement the three classes; `NamecheapError` with an empty list uses code `-1` and message `"Unknown Namecheap error"`.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** `git add src/core/errors.ts tests/core/errors.test.ts && git commit -m "feat(core): add error classes"`

### Task 3: Minimal XML parser

**Files:** Create `src/core/xml.ts`, `tests/core/xml.test.ts`

**Interfaces:**
- Consumes: `NamecheapParseError` from `./errors`.
- Produces:
  - `interface XmlNode { readonly name: string; readonly attrs: Readonly<Record<string, string>>; readonly text: string; readonly children: readonly XmlNode[] }`
  - `function parseXml(input: string): XmlNode` — returns the root element. `text` is the concatenated, entity-decoded, trimmed text and CDATA of the node's own character data. Element and attribute names keep their original case.

- [ ] **Step 1: Write failing tests** in `tests/core/xml.test.ts`:
  - parses `<?xml version="1.0" encoding="UTF-8"?>` plus a leading `<!-- source: docs -->` plus `<A x="1"><B/><B y="2">t</B></A>` into root `A` with `attrs {x:"1"}` and two `B` children, the second with `attrs {y:"2"}` and `text "t"`;
  - decodes `&amp; &lt; &gt; &quot; &apos; &#65; &#x41;` in text and in attribute values;
  - CDATA `<![CDATA[a < b]]>` yields text `"a < b"`;
  - an attribute value of `"007"` stays the string `"007"`;
  - throws `NamecheapParseError` for each of: empty string, `"<html><body>blocked</body></html" ` (unterminated), `<A><B></A>` (mismatched), `<A>&nope;</A>` (unknown entity), `<!DOCTYPE a [<!ENTITY x "y">]><a>&x;</a>` (DTD), plain text without any element, two root elements.
- [ ] **Step 2:** Run `yarn vitest run tests/core/xml.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `parseXml` as a single-pass hand-written scanner (index-based, no regex backtracking on the whole input); reject `<!DOCTYPE` and `<!ENTITY` outright.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** `git add src/core/xml.ts tests/core/xml.test.ts && git commit -m "feat(core): add minimal XML parser"`

### Task 4: Element reader

**Files:** Create `src/core/element.ts`, `tests/core/element.test.ts`

**Interfaces:**
- Consumes: `XmlNode`, `NamecheapParseError`.
- Produces: `class El` with constructor `(node: XmlNode)` and:
  - `name: string`, `text(): string`
  - `all(name: string): El[]` (direct children with that name, always an array)
  - `one(name: string): El` (throws `NamecheapParseError` naming the missing element), `optional(name: string): El | undefined`
  - `string(attr: string): string`, `optionalString(attr: string): string | undefined`
  - `number(attr: string): number`, `optionalNumber(attr: string): number | undefined` (non-numeric or empty → `NamecheapParseError`)
  - `boolean(attr: string): boolean`, `optionalBoolean(attr: string): boolean | undefined` (accepts `true`/`false` case-insensitively, anything else → `NamecheapParseError`)
  - `attributes(): Record<string, string>`

- [ ] **Step 1: Write failing tests**: a node with one `Domain` child returns `all("Domain")` of length 1; `all` of an absent name returns `[]`; `one("Missing")` throws `NamecheapParseError` whose message contains `Missing`; `string("ID")` of `"00123"` is exactly `"00123"`; `number("Count")` of `"42"` is `42`, of `"abc"` throws; `boolean("IsExpired")` accepts `"True"` and `"false"`, rejects `"yes"`; `optionalString` of an absent attribute is `undefined`; `string` of an absent attribute throws.
- [ ] **Step 2:** Run `yarn vitest run tests/core/element.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `El` as a thin wrapper over `XmlNode`.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** `git add src/core/element.ts tests/core/element.test.ts && git commit -m "feat(core): add typed element reader"`

### Task 5: Param serializer

**Files:** Create `src/core/serialize.ts`, `tests/core/serialize.test.ts`

**Interfaces:**
- Produces:
  - `const ACRONYMS: readonly string[]` initially `["SLD", "TLD", "IP", "ID", "DNS"]` (each group task adds the acronyms its documentation requires)
  - `function toParamName(key: string): string` — splits camelCase into words, upper-cases words listed in `ACRONYMS`, capitalizes the rest: `domainName → DomainName`, `sld → SLD`, `registrantFirstName → RegistrantFirstName`
  - `type ArrayStyle = "bracket" | "suffix"`
  - `function serializeParams(params: object, opts?: { arrayStyle?: ArrayStyle; keys?: Readonly<Record<string, string>> }): Array<[string, string]>` — nested objects concatenate key words (`{registrant: {firstName}} → RegistrantFirstName`); arrays become `Name[1]` (`bracket`, default) or `Name1` (`suffix`), 1-based; `undefined` and `null` are skipped; booleans and numbers use `String(value)`; `opts.keys` maps a camelCase path to an exact param name and wins over `toParamName`.

- [ ] **Step 1: Write failing tests**: `serializeParams({domainName: "a.com", sld: "a", tld: "com"})` equals `[["DomainName","a.com"],["SLD","a"],["TLD","com"]]`; `{page: 2, flag: true, skip: undefined, none: null}` equals `[["Page","2"],["Flag","true"]]`; `{nameservers: ["a","b"]}` equals `[["Nameservers[1]","a"],["Nameservers[2]","b"]]` for `bracket` and `[["Nameservers1","a"],["Nameservers2","b"]]` for `suffix`; `{registrant: {firstName: "Ana"}}` equals `[["RegistrantFirstName","Ana"]]`; `opts.keys` of `{domainName: "DomainName1"}` overrides; values containing `&`, spaces and `ç` are returned raw (encoding is the transport's job).
- [ ] **Step 2:** Run `yarn vitest run tests/core/serialize.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement both functions.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** `git add src/core/serialize.ts tests/core/serialize.test.ts && git commit -m "feat(core): add param serializer"`

### Task 6: Envelope handling

**Files:** Create `src/core/envelope.ts`, `tests/core/envelope.test.ts`

**Interfaces:**
- Consumes: `parseXml`, `El`, error classes.
- Produces: `function readEnvelope(xml: string): El` — parses the text, requires root `ApiResponse`, and returns the `CommandResponse` element. If `Status` is `ERROR`, or any `Errors/Error` exists, throws `NamecheapError` built from every `Error` element (`Number` attribute → `code`, element text → `message`; `code` is `-1` when `Number` is absent or non-numeric). If `Status` is `OK` but there is no `CommandResponse`, throws `NamecheapParseError`.

- [ ] **Step 1: Write failing tests**: an OK envelope returns an `El` named `CommandResponse`; an ERROR envelope with two `<Error Number="1">first</Error>` / `<Error Number="x">second</Error>` throws `NamecheapError` with `errors.length 2`, `code 1`, second item's `code -1`; root `html` throws `NamecheapParseError`; empty string throws `NamecheapParseError`; OK without `CommandResponse` throws `NamecheapParseError`; the namespace attribute `xmlns="http://api.namecheap.com/xml.response"` on the root does not break anything.
- [ ] **Step 2:** Run `yarn vitest run tests/core/envelope.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `readEnvelope`.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** `git add src/core/envelope.ts tests/core/envelope.test.ts && git commit -m "feat(core): add response envelope handling"`

### Task 7: Transport and test helpers

**Files:** Create `src/core/transport.ts`, `tests/helpers.ts`, `tests/core/transport.test.ts`

**Interfaces:**
- Consumes: `readEnvelope`, `El`, `NamecheapHttpError`.
- Produces:
  - `interface TransportConfig { apiUser: string; apiKey: string; userName?: string; clientIp: string; sandbox?: boolean; fetch?: typeof fetch; timeoutMs?: number }`
  - `interface CommandRequest { command: string; params: Array<[string, string]> }`
  - `type Send = (req: CommandRequest) => Promise<El>`
  - `function createTransport(config: TransportConfig): Send` — always `POST` to `https://api.sandbox.namecheap.com/xml.response` when `sandbox` is true, else `https://api.namecheap.com/xml.response`, with header `Content-Type: application/x-www-form-urlencoded` and a `URLSearchParams` body holding `ApiUser`, `ApiKey`, `UserName` (defaults to `apiUser`), `ClientIp`, `Command`, then `params`. The URL has no query string.
  - In `tests/helpers.ts`: `loadFixture(group: string, command: string): string` (reads `tests/fixtures/<group>/<command>.xml`). `createTestClient` is added in Task 9.
- Network failure, abort/timeout or non-2xx (HTTP 405 included, reported with `status 405`) → `NamecheapHttpError`, with `cause` set when the failure came from `fetch`; messages never contain the URL or the API key.

- [ ] **Step 1: Write failing tests** with a fake `fetch`: the call is a `POST` to exactly the production host (no `?`), with the form content type; the body contains the five base params and the command's params; `sandbox: true` switches the host; `userName` defaults to `apiUser`; a 502 response throws `NamecheapHttpError` with `status 502`; a 405 response throws with `status 405`; a rejecting `fetch` throws with `cause` set and `status undefined`; `timeoutMs: 5` with a fetch that only settles on `signal` abort throws `NamecheapHttpError`; for every failure above, `error.message`, `String(error.cause)` and `error.stack` do not contain the API key `"SECRET-KEY"`; a 200 response with body `<html>blocked</html>` rejects with `NamecheapParseError`.
- [ ] **Step 2:** Run `yarn vitest run tests/core/transport.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `createTransport` and `loadFixture` in `tests/helpers.ts`.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** `git add src/core/transport.ts tests/helpers.ts tests/core/transport.test.ts && git commit -m "feat(core): add transport"`

### Task 8: defineCommand and group

**Files:** Create `src/core/define.ts`, `tests/core/define.test.ts`

**Interfaces:**
- Consumes: `serializeParams`, `Send`, `El`.
- Produces:
  - `interface CommandDef<P, R> { name: string; arrayStyle?: ArrayStyle; keys?: Readonly<Record<string, string>>; parse: (cr: El) => R }`
  - `interface Command<P, R> extends CommandDef<P, R> { readonly _params?: P }`
  - `function defineCommand<P, R>(def: CommandDef<P, R>): Command<P, R>`
  - `type Group<C> = { [K in keyof C]: C[K] extends Command<infer P, infer R> ? ({} extends P ? (params?: P) => Promise<R> : (params: P) => Promise<R>) : never }`
  - `function group<C extends Record<string, Command<any, any>>>(commands: C, send: Send): Group<C>` — each method serializes `params` with the command's `arrayStyle`/`keys`, calls `send({ command: name, params })` and resolves to `command.parse(await send(...))`.

- [ ] **Step 1: Write failing tests**: a command called with `{domainName: "a.com"}` makes `send` receive `{command: "namecheap.x.y", params: [["DomainName","a.com"]]}` and the method resolves to `parse`'s return; `arrayStyle: "suffix"` and `keys` are honored; a command whose params are all optional can be called with no argument (`expectTypeOf` on the method signature); a command with required params rejects a call without them at type level (`// @ts-expect-error`).
- [ ] **Step 2:** Run `yarn vitest run tests/core/define.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `defineCommand` (identity with typing) and `group`.
- [ ] **Step 4:** Run the same command, then `yarn typecheck`. Expected: PASS and exit 0.
- [ ] **Step 5:** `git add src/core/define.ts tests/core/define.test.ts && git commit -m "feat(core): add defineCommand and group"`

### Task 9: Client and public exports

**Files:** Create `src/client.ts`, `tests/client.test.ts`; Modify `src/index.ts`, `tests/helpers.ts`

**Interfaces:**
- Consumes: `createTransport`, `group`, the 8 `commands/*` objects (each exports `<name>Commands`, see Group Task Procedure).
- Produces: `createTestClient(xml: string, init?: { status?: number }): { client: Namecheap; calls: Array<{ url: string; method: string; headers: Headers; body: URLSearchParams }> }` in `tests/helpers.ts` (a `Namecheap` with a fake `fetch` returning `xml`), and `class Namecheap` with constructor `(config: TransportConfig)` and readonly properties `domains`, `dns`, `ns`, `transfer`, `ssl`, `users`, `usersAddress`, `whoisGuard`, each `group(<commands>, send)`. `src/index.ts` exports `Namecheap` (default and named), the three error classes, and `export *` of each group's enums and types.

- [ ] **Step 1:** Create empty command objects first so the client compiles: each `src/commands/<group>.ts` exports `export const <group>Commands = {};` (Tasks 10-17 fill them).
- [ ] **Step 2: Write failing test** `tests/client.test.ts`: `new Namecheap({apiUser:"u", apiKey:"k", clientIp:"1.1.1.1"})` has the eight properties defined; importing `{ Namecheap, NamecheapError, NamecheapHttpError, NamecheapParseError }` from `../src` works. Run `yarn vitest run tests/client.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `src/client.ts`, update `src/index.ts`, and finish `createTestClient` in `tests/helpers.ts`.
- [ ] **Step 4:** Run `yarn vitest run && yarn typecheck && yarn lint`. Expected: PASS and exit 0.
- [ ] **Step 5:** `git add -A && git commit -m "feat: add Namecheap client and public exports"`

## Group Task Procedure (used by Tasks 10-17)

Each group task starts with a source gate and then repeats one loop per command. Sources are in spec section 6; the SDK clone is `git clone --depth 1 https://github.com/fwgapps/go-namecheap-sdk`.

0. **Gate.** Read the group's section in the SDK's `docs/namecheap-api-v2.md` (parameters, types, required flags) and the Go structs in `namecheap/<group>_*.go` (response shapes, which elements are lists). If something is missing or ambiguous, ask the maintainer; do not guess. The hint list in the task was already confirmed against the reference; record in the commit message any command found in the reference but not in the task.
1. **Fixture.** Copy `namecheaptest/fixtures/<sdk name>.xml` to `tests/fixtures/<group>/<command>.xml` with the first line `<!-- source: go-namecheap-sdk -->`. If the SDK has none for the command, write one from the documented sample with `<!-- source: docs -->`. `scripts/record-fixtures.mjs` later turns either into `source: sandbox`.
2. **Failing test** in `tests/<group>.test.ts`:
   ```ts
   it("<command> sends the documented request and parses the fixture", async () => {
     const { client, calls } = createTestClient(loadFixture("<group>", "<command>"));
     const result = await client.<property>.<method>(<documented example params>);
     expect(calls[0].body.get("Command")).toBe("<documented command name>");
     expect(calls[0].body.get("<DocumentedParam>")).toBe("<value>"); // one assertion per documented param
     expect(result).toEqual(<object written by hand from the fixture>);
   });
   ```
3. Run `yarn vitest run tests/<group>.test.ts -t "<command>"`. Expected: FAIL (`client.<property>.<method>` is not a function).
4. **Implement** in `src/commands/<group>.ts`: the params interface, the result interface, a `defineCommand<Params, Result>` entry in `<group>Commands`, and any enum the reference defines. Dates stay `string`. Add to `ACRONYMS` (Task 5) any acronym the parameter names require, with a test line in `tests/core/serialize.test.ts`.
5. Run the same command. Expected: PASS.

After the last command of a group:

- Add an error fixture `tests/fixtures/<group>/error.xml` and a test that a call against it rejects with `NamecheapError` carrying the fixture's code and message.
- Add a consistency test: for every `[key, command]` in `<group>Commands`, `command.name.split(".").at(-1)?.toLowerCase()` equals `key.toLowerCase()`.
- Run `yarn vitest run tests/<group>.test.ts && yarn typecheck && yarn lint`. Expected: PASS and exit 0.
- Commit: `git add -A && git commit -m "feat(<group>): add all <group> commands"`

### Task 10: Domains

**Files:** Modify `src/commands/domains.ts`; Create `tests/domains.test.ts`, `tests/fixtures/domains/*.xml`

**Interfaces:**
- Produces: `domainsCommands`, exposed as `client.domains`.
- Commands (confirmed by the SDK reference): `getList`, `getContacts`, `create`, `getTldList`, `setContacts`, `check`, `reactivate`, `renew`, `getRegistrarLock`, `setRegistrarLock`, `getInfo`.

- [ ] Create `NOTICE` (once, in the repository root) stating that the fixtures marked `source: go-namecheap-sdk` are copied from `namecheap/go-namecheap-sdk`, licensed under Apache-2.0, with the license URL.
- [ ] Follow the Group Task Procedure for every command. For `getList`, also add a fixture with an empty result and a test that `result` is an empty list (not an exception) and `paging` still parses; for `check`, a fixture with a single `DomainCheckResult` and one with several, both producing arrays.

### Task 11: Domains DNS

**Files:** Modify `src/commands/dns.ts`; Create `tests/dns.test.ts`, `tests/fixtures/dns/*.xml`

**Interfaces:**
- Produces: `dnsCommands`, exposed as `client.dns`.
- Commands (confirmed by the SDK reference): `setDefault`, `setCustom`, `getList`, `getHosts`, `getEmailForwarding`, `setEmailForwarding`, `setHosts`.

- [ ] Follow the Group Task Procedure. For `setHosts` and `setEmailForwarding`, assert the array style the docs show (`arrayStyle` on the definition) and add a test with at least 3 records.

### Task 12: Domains NS

**Files:** Modify `src/commands/ns.ts`; Create `tests/ns.test.ts`, `tests/fixtures/ns/*.xml`

**Interfaces:**
- Produces: `nsCommands`, exposed as `client.ns`.
- Commands (confirmed by the SDK reference): `create`, `delete`, `getInfo`, `update`.

- [ ] Follow the Group Task Procedure.

### Task 13: Domains Transfer

**Files:** Modify `src/commands/transfer.ts`; Create `tests/transfer.test.ts`, `tests/fixtures/transfer/*.xml`

**Interfaces:**
- Produces: `transferCommands`, exposed as `client.transfer`.
- Commands (confirmed by the SDK reference): `create`, `getStatus`, `updateStatus`, `getList`.

- [ ] Follow the Group Task Procedure.

### Task 14: SSL

**Files:** Modify `src/commands/ssl.ts`; Create `tests/ssl.test.ts`, `tests/fixtures/ssl/*.xml`

**Interfaces:**
- Produces: `sslCommands`, exposed as `client.ssl`.
- Commands (confirmed by the SDK reference): `create`, `getList`, `parseCSR`, `getApproverEmailList`, `activate`, `resendApproverEmail`, `getInfo`, `renew`, `reissue`, `resendFulfillmentEmail`, `purchaseMoreSans`, `revokeCertificate`, `editDCVMethod`. The reference spells several in all-lowercase (e.g. `namecheap.ssl.resendfulfillmentemail`); keep its spelling in `name`.

- [ ] Follow the Group Task Procedure.

### Task 15: Users

**Files:** Modify `src/commands/users.ts`; Create `tests/users.test.ts`, `tests/fixtures/users/*.xml`

**Interfaces:**
- Produces: `usersCommands`, exposed as `client.users`.
- Commands (confirmed by the SDK reference): `getPricing`, `getBalances`, `changePassword`, `update`, `createAddFundsRequest`, `getAddFundsStatus`, `create`, `login`, `resetPassword`.

- [ ] Follow the Group Task Procedure. For `getPricing`, include a fixture with nested product categories and prices and assert every level is an array in the result.

### Task 16: Users Address

**Files:** Modify `src/commands/users-address.ts`; Create `tests/users-address.test.ts`, `tests/fixtures/users-address/*.xml`

**Interfaces:**
- Produces: `usersAddressCommands`, exposed as `client.usersAddress`.
- Commands (confirmed by the SDK reference): `create`, `delete`, `getInfo`, `getList`, `setDefault`, `update`.

- [ ] Follow the Group Task Procedure.

### Task 17: WhoisGuard

**Files:** Modify `src/commands/whoisguard.ts`; Create `tests/whoisguard.test.ts`, `tests/fixtures/whoisguard/*.xml`

**Interfaces:**
- Produces: `whoisGuardCommands`, exposed as `client.whoisGuard`.
- Commands (confirmed by the SDK reference): `changeEmailAddress`, `enable`, `disable`, `getList`, `renew`. The reference spells them all-lowercase (e.g. `namecheap.whoisguard.getlist`); keep its spelling in `name`. `allot`, `unallot` and `discard` exist only in the Go SDK and are out of scope unless the maintainer asks.

- [ ] Follow the Group Task Procedure.

### Task 18: Sandbox fixture recorder

**Files:** Create `scripts/record-fixtures.mjs`, `scripts/fixture-requests.example.json`, `tests/scripts/record-fixtures.test.ts`

**Interfaces:**
- Consumes: environment variables `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY`, `NAMECHEAP_CLIENT_IP`.
- Produces: a zero-dependency Node ESM script. Input: a JSON file path argument listing `{ "fixture": "domains/getList", "command": "namecheap.domains.getList", "params": {"Page": "1"} }` entries (params already in Namecheap's PascalCase). Output: for each entry, `tests/fixtures/<fixture>.xml` whose first line is `<!-- source: sandbox -->`. It always sends a form-encoded POST (same as the library) to `https://api.sandbox.namecheap.com/xml.response`; the host is a constant and cannot be changed by flag or env.

- [ ] **Step 1: Write failing tests** in `tests/scripts/record-fixtures.test.ts` against exported pure helpers (`buildRequestUrl(entry, env)`, `maskSecrets(text, env)`): the URL host is the sandbox host; the output of `maskSecrets` contains no occurrence of the API key; a missing env var throws a clear error.
- [ ] **Step 2:** Run `yarn vitest run tests/scripts/record-fixtures.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement the script and helpers; the script prints a reminder to review the XML for personal data before committing.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** `git add scripts tests/scripts && git commit -m "feat(scripts): add sandbox fixture recorder"`

### Task 19: Express example

**Files:** Modify `examples/express/src/**`, `examples/express/package.json`, `examples/express/README.md`

**Interfaces:**
- Consumes: the 1.0 public API (`client.<group>.<method>`) and the error classes.

- [ ] **Step 1:** Rewrite `examples/express/src/services/namecheap.ts` and the eight routers against the new API; mount `ssl` and `transfer` from their own router files (fixing the swapped imports in the 0.6 `server.ts`).
- [ ] **Step 2:** Add one error-handling middleware that maps `NamecheapError` to 400, `NamecheapParseError` and `NamecheapHttpError` to 502, anything else to 500, returning `{ error: { code, message } }` and never the request URL.
- [ ] **Step 3:** Run `cd examples/express && yarn install && yarn tsc --noEmit`. Expected: exit 0 (point the example's dependency at the local package with `"@fwgapps/namecheap": "file:../.."`).
- [ ] **Step 4:** `git add examples && git commit -m "docs(examples): update the Express bridge to the 1.0 API"`

### Task 20: CI, README, migration guide and release commit

**Files:** Modify `.github/workflows/publish.yml`, `README.md`; Create `MIGRATION.md`

**Interfaces:**
- Consumes: the final public API from Tasks 9 and 10-17.

- [ ] **Step 1:** Rewrite `.github/workflows/publish.yml`: on pull requests run `yarn lint`, `yarn typecheck`, `yarn test --run --coverage`, `yarn build`; on push to `main` add a `release` job (needs the checks) with `permissions: { contents: write, id-token: write, issues: write, pull-requests: write }`, `NPM_CONFIG_PROVENANCE: true`, running `yarn semantic-release`. Keep the Codecov upload and the audit job. Pin Node to 20.
- [ ] **Step 2:** Rewrite `README.md` in English: install, a runnable example per group property, error handling with the three classes, `timeoutMs` and `fetch` options, runtime support (Node >= 20, edge, no browser), and the sandbox/production warning (`sandbox` defaults to `false`, meaning production).
- [ ] **Step 3:** Write `MIGRATION.md` with a table mapping every 0.6 method/type to its 1.0 equivalent (get the 0.6 surface with `git show 2cb5f7f:src/methods/<file>`), plus sections on errors (objects thrown → `Error` subclasses), return shapes, renamed properties (`domainsDns → dns`, `domainsNs → ns`, `domainsTransfer → transfer`, `whoIsGuard → whoisGuard`, `domainPrivacy` removed), and the removal of the browser/CDN build.
- [ ] **Step 4:** Run `yarn lint && yarn typecheck && yarn test --run --coverage && yarn build`. Expected: all exit 0 and coverage thresholds met.
- [ ] **Step 5:** Commit with the breaking footer:
  ```bash
  git add -A
  git commit -m "feat!: rewrite the library from scratch for 1.0" -m "BREAKING CHANGE: new client API, zero dependencies, Node >= 20, no browser build. See MIGRATION.md."
  ```
