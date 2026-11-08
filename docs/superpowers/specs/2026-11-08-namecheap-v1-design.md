# @fwgapps/namecheap 1.0 — Design

Date: 2026-11-08
Status: Draft, pending review

## 1. Purpose and scope

Rewrite `@fwgapps/namecheap` from scratch as a typed TypeScript client for the
Namecheap XML API, published to npm as version 1.0.0.

The product stays a **library**. The REST bridge remains an example
(`examples/express`), not a deliverable of its own.

Decisions agreed with the maintainer:

| Topic | Decision |
| --- | --- |
| Product | npm library (not a standalone REST service) |
| Public API | Free to break; released as 1.0.0 with a migration guide |
| Runtimes | Node >= 20 and edge runtimes (Cloudflare Workers, Deno, Bun). No browser, no CDN/IIFE build |
| Dependencies | Zero runtime dependencies. Own minimal XML parser |
| Coverage | Every command of every group, each covered by tests on XML fixtures |
| Architecture | Declarative command table (see section 3) |
| Language | Everything in the repository is written in English |

Success criteria:

- Every Namecheap API command listed in the official documentation has a typed
  method and a contract test.
- No runtime dependency in `package.json`.
- A consumer on the 0.6 API can migrate using `MIGRATION.md` alone.
- The package works unchanged on Node 20+ and on a Cloudflare Worker.

Non-goals: browser support, automatic retries, caching, a hosted REST service,
code generation from documentation.

## 2. Data flow and layout

Flow of a call such as `client.domains.getList({ page: 2 })`:

1. The public method looks up its command definition (`namecheap.domains.getList`).
2. The serializer turns params into query pairs in PascalCase. POST commands send
   the remaining params in the body as `RequestValues`.
3. The transport builds the URL with `ApiUser`, `ApiKey`, `UserName`, `ClientIp`
   and `Command`, then calls `fetch`. Network or non-2xx failures raise
   `NamecheapHttpError`.
4. The XML parser turns the response text into a node tree.
5. The envelope check raises `NamecheapError` when `Status="ERROR"`.
6. The command's `parse` function converts `CommandResponse` into a typed,
   camelCase object.

Layout:

```
src/
  index.ts          exports Namecheap, errors, enums and types
  client.ts         Namecheap class: configuration and groups
  core/
    transport.ts    URL building, GET/POST, injectable fetch, timeout
    serialize.ts    params -> query pairs / RequestValues
    xml.ts          minimal XML parser
    envelope.ts     Status and error handling
    errors.ts       NamecheapError, NamecheapHttpError, NamecheapParseError
    define.ts       defineCommand and group helpers
  commands/
    domains.ts  dns.ts  ns.ts  transfer.ts
    ssl.ts  users.ts  users-address.ts  whoisguard.ts
tests/
  fixtures/<group>/<command>.xml
  <group>.test.ts
```

`core/` knows nothing about specific commands. `commands/*.ts` hold only command
definitions plus the param and result types next to them.

## 3. Command definition and types

```ts
export const getList = defineCommand<GetListParams, GetListResult>({
  name: "namecheap.domains.getList",
  http: "GET", // or "POST" with RequestValues
  parse: (cr) => ({
    domains: cr.all("Domain").map(parseDomain),
    paging: parsePaging(cr.one("Paging")),
  }),
});
```

- `<Params, Result>` are written by hand per command. Namecheap publishes no
  machine-readable schema, so the compiler guarantees that `parse` returns
  `Result` and that the public method accepts `Params`.
- `cr.all("Tag")` always returns an array, even for a single element. There is no
  global list of array paths.
- The parser does not coerce values. Each field is read with `attr.string()`,
  `attr.number()` or `attr.bool()`, so values such as `"007"` or numeric domain
  names are never mangled.
- Param names are converted to PascalCase with an acronym table (`SLD`, `TLD`,
  `IP`, `ID`, `DNS`, ...), overridable per command. **To verify** against the
  documentation: which parameter names actually require upper-case acronyms.
- `group(commands)` binds a command object to the transport and produces
  `client.domains.getList(params)`. The method name is the last segment of the
  command name, and the group type is inferred from the object.
- The client is created with
  `new Namecheap({ apiUser, apiKey, userName?, clientIp, sandbox?, fetch?, timeoutMs? })`.

## 4. XML parser, errors and tests

XML parser (`core/xml.ts`):

- Supports elements, attributes, text, self-closing tags, CDATA, comments, the
  XML declaration and the entities `&amp; &lt; &gt; &quot; &apos;` plus numeric
  character references.
- Returns nodes with `name`, `attrs`, `children` and `text`. Names keep their
  original case; each command's `parse` converts to camelCase.
- Malformed XML raises `NamecheapParseError`.
- DTDs and external entities are not supported, which rules out XXE by
  construction.

Errors (all extend `Error`, set `name`, and use `cause` when relevant):

- `NamecheapError`: API replied `Status="ERROR"`. Fields: `code` (the `Number` of
  the first error), `message`, and `errors` with the full list.
- `NamecheapHttpError`: network failure or non-2xx status. Fields: `status`,
  `statusText`.
- `NamecheapParseError`: malformed XML or unexpected response shape.
- No automatic retries. Commands such as `create` and `renew` are billed, and
  repeating them is unsafe; the caller decides.

Tests (Vitest):

- Unit tests for the parser and serializer, including edge cases (entities,
  CDATA, single-item arrays, `SLD`/`TLD`).
- One contract test per command using a fake `fetch`: it asserts the request sent
  (URL, method, body) and that the fixture XML becomes exactly the expected JSON.
  Each group also has at least one error fixture.
- Fixtures live in `tests/fixtures/<group>/<command>.xml`. Each starts with a
  comment declaring its origin: `source: docs` or `source: sandbox`.
- `scripts/record-fixtures` runs against the Namecheap sandbox on the
  maintainer's machine and replaces `source: docs` fixtures. Credentials come
  from environment variables only, and the script masks the API key in output.
- CI fails below a coverage threshold, set during planning.

## 5. Packaging, CI, release and migration

- Build with `tsup`: ESM, CJS and `.d.ts`. The IIFE build and the `unpkg` and
  `jsdelivr` fields are removed.
- `package.json` has an `exports` map (`import`, `require`, `types`),
  `engines.node >= 20`, `files: ["dist"]`, `sideEffects: false`, and no
  `dependencies`.
- Tooling kept: Yarn, ESLint, Prettier, Vitest, Husky, Commitizen. Unused tools
  (`ts-node`, `ts-node-dev`) are removed. The `@fwg/...` path aliases are
  replaced by relative imports.
- CI on pull requests: `lint`, `tsc --noEmit`, `test` with coverage, `build`.
- Release on `main`: `semantic-release` publishes to npm with provenance. The
  final rewrite commit carries a `BREAKING CHANGE:` footer so the version goes
  from 0.6.0 to 1.0.0. Nothing is published without the maintainer's request.
- `MIGRATION.md` maps every 0.6 method and type to its 1.0 equivalent and lists
  changes in errors, return shapes and the removal of the browser/CDN build.
- `README.md` is rewritten with examples that run.
- `examples/express` stays as the REST bridge example, updated to the new API.
  It fixes the swapped `ssl` and `transfer` routers and maps `NamecheapError`
  to proper HTTP status codes instead of always returning 500.
- Work happens on branch `claude/trusting-einstein-vizfy8`; the old `src/` is
  removed and the new one built, keeping git history.

## 6. Source of truth for commands

Command names, parameters and response fields enter the code only after they are
checked against one of these sources, in this order:

1. The official documentation at `https://www.namecheap.com/support/api/methods/`.
   The site blocks automated clients with a Cloudflare challenge, so the
   maintainer provides the pages. The list of methods is needed first, then the
   page of each group when that group is implemented.
2. Real responses recorded from the Namecheap sandbox (fixtures with
   `source: sandbox`).
3. The 0.6 source code, only as a hint, always flagged as unverified.

Open input needed from the maintainer before planning the commands:

- The list of methods from the documentation index.
- Whether sandbox credentials and an allowed IP are available for recording
  fixtures.
