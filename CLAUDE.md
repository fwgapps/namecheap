# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@fwgapps/namecheap`: a typed, zero-runtime-dependency TypeScript client for the Namecheap XML API (59 commands). Node >= 22, ESM + CJS builds via tsup. Server-side only on purpose (no browser support). The built-in XML parser has no DTD/external-entity support; do not add runtime dependencies.

## Commands

Package manager is yarn.

```bash
yarn test                      # vitest in watch mode (use `yarn test --run` for a single pass)
yarn test --run tests/dns.test.ts          # one test file
yarn test --run -t "setHosts"              # tests matching a name
yarn coverage                  # thresholds enforced: 95% lines/functions/statements, 90% branches
yarn lint                      # eslint (src, tests, scripts); `yarn lint:fix` to autofix
yarn typecheck                 # tsc --noEmit
yarn build                     # tsup -> dist (ESM, CJS, d.ts)
yarn test:e2e                  # hits the Namecheap SANDBOX; needs .env (copy .env.example)
```

CI runs lint, typecheck, `test --run --coverage` and build on Node 22/24/26. Husky: pre-commit runs lint-staged (eslint --fix + prettier); pre-push runs `yarn test --run`. Commits follow Conventional Commits (commitizen prompt on plain `git commit`); semantic-release publishes from `main` and updates CHANGELOG.md, so commit types drive versioning.

## Architecture

- `src/core/` is the engine; `src/commands/*.ts` declare commands on top of it; `src/client.ts` assembles them.
- A command is declared with `defineCommand<Params, Result>({ name, parse, arrayStyle?, keys?, validate? })` (`src/core/define.ts`). `parse` receives the `CommandResponse` element wrapped in `El` (`core/element.ts`, with typed accessors like `string`, `boolean`, `one`, `lenientNumber`). Params/Result interfaces live next to each command, camelCase; `keys` maps dotted camelCase paths to Namecheap's exact wire parameter names, and `serialize.ts` flattens params (arrays via `arrayStyle`).
- `run(command, send, params)` is the single execution path: `validate` -> serialize -> reject reserved names (`apiuser`, `apikey`, `username`, `clientip`, `command`; set by transport) -> `send` -> `parse`. A `NamecheapParseError` after a successful response is rewrapped with a "action may have been performed" warning.
- `core/transport.ts` (`createTransport`) POSTs form-encoded credentials + params, picks sandbox vs production URL, and `core/envelope.ts` unwraps `ApiResponse` / throws `NamecheapError` for API errors. No retries, no logging.
- `Namecheap` (client) uses `group(commands, send)` to turn each `*Commands` record into typed methods (`nc.domains.check(...)`). Params are optional in the method signature only if all fields are optional.
- Tree-shaking: every command is also exported standalone as `<group><Method>` (e.g. `domainsCheck`) from `src/index.ts`, used with `run`. Command definitions are marked `/* @__PURE__ */` and the package is `sideEffects: false`; `tests/treeshake.test.ts` guards this, so keep that annotation on new commands and export them from the group's `*Commands` record.
- `validate` is used to block dangerous calls before any request (e.g. `dns.setHosts` rejects an empty `hosts` because it replaces the whole zone).

## Testing

- Unit tests use a fake `fetch` (`tests/helpers.ts`: `createTestClient`, `createFakeFetch`, `okEnvelope`, `loadFixture`) and XML fixtures in `tests/fixtures/<group>/<command>.xml`. Assert both the exact request sent and the parsed result.
- Fixtures are recorded from the real sandbox with `scripts/record-fixtures.mjs` (see `scripts/fixture-requests.example.json`); the script refuses password-checking commands (failed logins lock the ApiUser for 24h) and is hardcoded to the sandbox.
- `tests/e2e/` runs only through `yarn test:e2e` against the sandbox with credentials from `.env`.
- `examples/express/` is a separate project (own package.json/yarn.lock), excluded from vitest and root tooling. `docs/` is the published static site; `docs/superpowers/` holds the v1 design spec and plan.
