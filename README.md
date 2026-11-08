# @fwgapps/namecheap

[![CI/CD Pipeline](https://github.com/fwgapps/namecheap/actions/workflows/publish.yml/badge.svg)](https://github.com/fwgapps/namecheap/actions/workflows/publish.yml)
[![npm](https://img.shields.io/npm/v/@fwgapps/namecheap)](https://www.npmjs.com/package/@fwgapps/namecheap)
![license](https://img.shields.io/npm/l/@fwgapps/namecheap)

A typed, zero-dependency client for the [Namecheap XML API](https://www.namecheap.com/support/api/intro/). Every command returns a plain, fully typed object instead of raw XML.

> Upgrading from 0.x? Read [MIGRATION.md](./MIGRATION.md). Version 1.0 is a complete rewrite and is not backwards compatible.

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Using a single command (tree shaking)](#using-a-single-command-tree-shaking)
- [Error handling](#error-handling)
- [Safety notes](#safety-notes)
- [Testing with a fake fetch](#testing-with-a-fake-fetch)
- [Known gaps](#known-gaps)
- [Examples](#examples)
- [API coverage](#api-coverage)
- [Contributing and license](#contributing-and-license)
- [Attribution](#attribution)

## Features

- Fully typed parameters and results for 59 Namecheap commands.
- Zero runtime dependencies: the XML parser is built in (no DTD or external entity support).
- ESM and CommonJS builds with bundled type declarations.
- Tree-shakeable: import just the commands you use (see [Using a single command](#using-a-single-command-tree-shaking)).
- Node.js >= 20 and edge runtimes that provide `fetch` (Cloudflare Workers, Deno, Bun, ...).
- No automatic retries and no logging.
- **No browser support, on purpose.** The API key must never reach a browser, and Namecheap only accepts requests from an allow-listed server IP. Call this library from your backend.

## Installation

```bash
npm install @fwgapps/namecheap
# or
yarn add @fwgapps/namecheap
```

## Quick start

```ts
import { Namecheap } from "@fwgapps/namecheap";

const nc = new Namecheap({
  apiUser: "your-api-user",
  apiKey: process.env.NAMECHEAP_API_KEY ?? "",
  clientIp: "203.0.113.10", // the public IP you whitelisted at Namecheap
  sandbox: true, // use the sandbox while you experiment
});

const { domains, paging } = await nc.domains.getList({ pageSize: 20 });
console.log(paging.totalItems, domains.map((d) => d.name));

const results = await nc.domains.check({ domainList: "example.com,example.net" });
console.log(results.map((r) => `${r.domain}: ${r.available}`));
```

`Namecheap` is both the default export and a named export.

## Configuration

```ts
const nc = new Namecheap({
  apiUser: "your-api-user", // string, required: your API user name
  apiKey: "your-api-key", // string, required: your API key
  clientIp: "203.0.113.10", // string, required: the whitelisted IP the requests come from
  userName: "account-name", // string, optional: the account to act on, defaults to apiUser
  sandbox: true, // boolean, optional: defaults to false (PRODUCTION)
  fetch: globalThis.fetch, // optional: your own fetch implementation
  timeoutMs: 15_000, // number, optional: abort a request after this many milliseconds
});
```

| Field       | Type                  | Default            | Notes                                                                                   |
| ----------- | --------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| `apiUser`   | `string`              | required           | Sent as `ApiUser`.                                                                      |
| `apiKey`    | `string`              | required           | Sent as `ApiKey`, in the POST body only.                                                |
| `clientIp`  | `string`              | required           | Sent as `ClientIp`. Must match an IP on your Namecheap API whitelist.                   |
| `userName`  | `string`              | `apiUser`          | Sent as `UserName`. Use it when acting on a different account than the API user.        |
| `sandbox`   | `boolean`             | `false`            | Must be a boolean. `true` talks to `api.sandbox.namecheap.com`; `false` or omitted talks to **production**. Any other value throws a `TypeError`. |
| `fetch`     | `typeof fetch`        | `globalThis.fetch` | Inject a custom or fake `fetch` (tests, proxies, edge runtimes).                        |
| `timeoutMs` | `number`              | no timeout         | Implemented with `AbortSignal.timeout`; a timeout surfaces as a `NamecheapHttpError`.   |

> **WARNING: `sandbox` defaults to `false`, which means PRODUCTION.** Forgetting it sends real, billed commands (registrations, renewals, transfers) and changes real DNS. Set `sandbox: true` explicitly while developing. `sandbox` must be a real boolean: a string such as `"true"` throws a `TypeError` at construction instead of silently selecting production, so convert environment variables yourself (`sandbox: process.env.NAMECHEAP_SANDBOX === "true"`).

> **IP whitelist.** Namecheap rejects requests from IP addresses that are not on your API whitelist, in the sandbox and in production. Enable API access and add your server's public IP in the Namecheap dashboard (Profile, Tools, Namecheap API Access), and pass the same address as `clientIp`.

## Usage

Every group is a property of the client, and every method takes a single params object. Optional parameters can be left out; a method with only optional parameters can be called with no argument.

The snippets below assume `nc` is the client from the [Quick start](#quick-start).

### domains

```ts
const { domains, paging } = await nc.domains.getList({ listType: "EXPIRING", page: 1, pageSize: 50 });
const availability = await nc.domains.check({ domainList: "example.com,example.org" });
const info = await nc.domains.getInfo({ domainName: "example.com" });
const lock = await nc.domains.getRegistrarLock({ domainName: "example.com" });
await nc.domains.setRegistrarLock({ domainName: "example.com", lockAction: "LOCK" });
const tlds = await nc.domains.getTldList();
console.log(domains.length, paging.totalItems, availability[0]?.available, info.domainName, lock.registrarLockStatus, tlds.length);
```

`domains.create`, `domains.renew`, `domains.reactivate` and `domains.setContacts` are billed or change ownership data; see the [API coverage](#api-coverage) table and the type definitions for their parameters.

### dns

```ts
const dnsList = await nc.dns.getList({ sld: "example", tld: "com" });
const current = await nc.dns.getHosts({ sld: "example", tld: "com" });
console.log(dnsList.nameservers, current.hosts.length);

// Replaces the WHOLE zone, see "Safety notes".
await nc.dns.setHosts({
  sld: "example",
  tld: "com",
  emailType: "MX",
  hosts: [
    { hostName: "@", recordType: "A", address: "203.0.113.5", ttl: 1800 },
    { hostName: "www", recordType: "CNAME", address: "example.com.", ttl: 1800 },
    { hostName: "@", recordType: "MX", address: "mail.example.com.", mxPref: 10 },
  ],
});

await nc.dns.setDefault({ sld: "example", tld: "com" });
await nc.dns.setCustom({ sld: "example", tld: "com", nameservers: "ns1.example.net,ns2.example.net" });
await nc.dns.setEmailForwarding({
  domainName: "example.com",
  forwards: [{ mailBox: "info", forwardTo: "me@example.net" }],
});
const forwarding = await nc.dns.getEmailForwarding({ domainName: "example.com" });
console.log(forwarding.forwards);
```

### ns

```ts
await nc.ns.create({ sld: "example", tld: "com", nameserver: "ns1.example.com", ip: "203.0.113.20" });
const ns = await nc.ns.getInfo({ sld: "example", tld: "com", nameserver: "ns1.example.com" });
await nc.ns.update({ sld: "example", tld: "com", nameserver: "ns1.example.com", oldIP: "203.0.113.20", ip: "203.0.113.21" });
await nc.ns.delete({ sld: "example", tld: "com", nameserver: "ns1.example.com" });
console.log(ns.ip);
```

### transfer

```ts
const started = await nc.transfer.create({ domainName: "example.com", years: 1, eppCode: "the-epp-code" });
const status = await nc.transfer.getStatus({ transferID: started.transferID });
const { transfers } = await nc.transfer.getList({ listType: "INPROGRESS" });
await nc.transfer.updateStatus({ transferID: started.transferID, resubmit: true });
console.log(status.status, transfers.length);
```

### ssl

```ts
const csrInfo = await nc.ssl.parseCSR({ csr: "-----BEGIN CERTIFICATE REQUEST-----\n..." });
const { certificates } = await nc.ssl.getList({ listType: "Active" });
const emails = await nc.ssl.getApproverEmailList({ domainName: "example.com", certificateType: "PositiveSSL" });
const cert = await nc.ssl.getInfo({ certificateID: 12345 });
console.log(csrInfo.commonName, certificates.length, emails.genericEmails, cert.status);
```

Activation, reissue, renewal and purchase (`ssl.create`, `ssl.activate`, `ssl.reissue`, `ssl.renew`, `ssl.purchaseMoreSans`) are available too; see [Known gaps](#known-gaps) before relying on the activation flow.

### users

```ts
const balances = await nc.users.getBalances();
const pricing = await nc.users.getPricing({ productType: "DOMAIN", productCategory: "DOMAINS", actionName: "REGISTER", productName: "COM" });
const funds = await nc.users.createAddFundsRequest({ paymentType: "Creditcard", amount: 50, returnUrl: "https://example.com/funds-done" });
const fundsStatus = await nc.users.getAddFundsStatus({ tokenId: funds.tokenID });
console.log(balances.availableBalance, pricing.productTypes.length, fundsStatus.status);
```

### usersAddress

```ts
const addresses = await nc.usersAddress.getList();
const first = addresses[0];
if (first) {
  const address = await nc.usersAddress.getInfo({ addressId: first.addressId });
  await nc.usersAddress.setDefault({ addressId: first.addressId });
  console.log(address.addressName);
}
```

### whoisGuard

The client property is `whoisGuard`. The 0.x name `whoIsGuard` is gone; see the migration guide.

```ts
const { whoisguards } = await nc.whoisGuard.getList({ listType: "ALLOTED" });
const subscription = whoisguards[0];
if (subscription) {
  await nc.whoisGuard.enable({ whoisguardID: subscription.id, forwardedToEmail: "me@example.net" });
  await nc.whoisGuard.changeEmailAddress({ whoisguardID: subscription.id });
  await nc.whoisGuard.disable({ whoisguardID: subscription.id });
}
```

## Using a single command (tree shaking)

`new Namecheap(...)` is the convenient entry point, but it carries all 59 commands, because the client object exposes every group. If you only need a few commands (a serverless function, an edge worker), import them one by one and run them with `run`. A bundler then keeps only what you use:

```ts
import { createTransport, domainsCheck, run } from "@fwgapps/namecheap";

const send = createTransport({ apiUser: "user", apiKey: "key", clientIp: "203.0.113.10", sandbox: true });

const result = await run(domainsCheck, send, { domainList: "example.com,example.net" });
```

Every command is also exported on its own, named `<group><Method>`: `domainsCheck`, `dnsSetHosts`, `nsDelete`, `transferGetList`, `sslGetList`, `sslParseCSR`, `usersGetBalances`, `usersAddressCreate`, `whoisGuardRenew`, and so on (the group is the same name you use on the client, with the method capitalized). `run` behaves exactly like the client methods: same validation, same errors, same typing of the parameters.

Approximate sizes of a minified bundle (esbuild, measured on this package):

| What you import                                | Minified | Gzip   |
| ---------------------------------------------- | -------: | -----: |
| only the error classes                         |  ~0.3 KB | ~0.2 KB |
| `createTransport` + one command + `run`        |  ~9.4 KB | ~3.8 KB |
| `createTransport` + two commands + `run`       |  ~9.9 KB | ~4.0 KB |
| the `Namecheap` class (any use of it)          | ~29.6 KB | ~8.4 KB |

The package declares `"sideEffects": false`, and a test in this repository bundles a single-command consumer to make sure the other commands stay out of the bundle.

## Error handling

All API, HTTP and response failures are instances of one of three `Error` subclasses, exported from the package. Programmer or configuration mistakes (an invalid `sandbox`, `dns.setHosts` validation, serializer rejections, reserved parameter names) throw a plain `TypeError` instead.

| Class                  | Thrown when                                                                              | Useful fields                                  |
| ---------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `NamecheapError`       | The API answered with `Status="ERROR"`.                                                  | `code` (first error number), `errors` (all)    |
| `NamecheapHttpError`   | The request failed (network, timeout, redirect) or the HTTP status is not 2xx.           | `status`, `statusText`, `cause`                |
| `NamecheapParseError`  | The body is not valid XML, is not a Namecheap envelope, or lacks a documented field.     | `message`, `cause`                             |

```ts
import { Namecheap, NamecheapError, NamecheapHttpError, NamecheapParseError } from "@fwgapps/namecheap";

const nc = new Namecheap({ apiUser: "user", apiKey: "key", clientIp: "203.0.113.10", sandbox: true });

try {
  await nc.dns.getHosts({ sld: "example", tld: "com" });
} catch (error) {
  if (error instanceof NamecheapError) {
    console.error(error.code, error.message, error.errors);
  } else if (error instanceof NamecheapHttpError) {
    console.error(error.status, error.statusText);
  } else if (error instanceof NamecheapParseError) {
    console.error("Unexpected response shape:", error.message);
  } else {
    throw error;
  }
}
```

Error messages never contain request data or credentials. Apart from `NamecheapError`, whose message is Namecheap's own error text, they contain at most short fragments of the response (element or attribute names, a truncated entity name).

**There are no automatic retries, on purpose.** Many commands are billed (register, renew, transfer, purchase). Retrying a request whose outcome is unknown could charge you twice. Decide per call whether a retry is safe; read-only commands such as `getList` or `check` usually are.

After a billed or account-changing command, a `NamecheapParseError` (Namecheap answered OK but the response could not be read) or a `timeoutMs` abort means the outcome is **unknown**: the action may have been performed. Reconcile with `getList` or `getInfo` before retrying.

**HTTP 405 means rate limiting.** Namecheap answers 405 when you exceed its request limits, so a `NamecheapHttpError` with `status === 405` is a signal to slow down, not a bug in your request.

## Safety notes

- `dns.setHosts` **replaces the whole zone**: every record you do not list is deleted. Read the current records with `dns.getHosts` first and send the complete desired list. The library rejects an empty `hosts` list with a `TypeError` before sending anything.
- `dns.setHosts` with `emailType` other than `MX`: the reference says MX records are silently discarded unless the resulting email mode is `MX`. Because `setHosts` replaces the whole zone, listing MX hosts under another mode loses your mail routing.
- Credentials travel in the POST body (`application/x-www-form-urlencoded`), never in the URL, so they do not end up in access logs or proxies that record URLs.
- The library never logs anything. Do not log the client config or error `cause` objects from your own code in production.
- `sandbox` defaults to production. See the [warning above](#configuration).

## Testing with a fake fetch

Pass your own `fetch` to test your code without network access or credentials:

```ts
import { Namecheap } from "@fwgapps/namecheap";

const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
  <Errors />
  <RequestedCommand>namecheap.domains.dns.setDefault</RequestedCommand>
  <CommandResponse Type="namecheap.domains.dns.setDefault">
    <DomainDNSSetDefaultResult Domain="example.com" Updated="true" />
  </CommandResponse>
</ApiResponse>`;

const calls: Array<{ url: string; body: string }> = [];
const fakeFetch: typeof fetch = async (input, init) => {
  calls.push({ url: String(input), body: String(init?.body) });
  return new Response(xml, { status: 200 });
};

const nc = new Namecheap({ apiUser: "u", apiKey: "k", clientIp: "127.0.0.1", sandbox: true, fetch: fakeFetch });
const result = await nc.dns.setDefault({ sld: "example", tld: "com" });
console.log(result.updated, calls[0]?.url);
```

## Known gaps

1. `ssl.activate` and `ssl.reissue` do not expose domain control validation (DCV) parameters or the 0.6 OV/EV organisation option sets (organisation, department, admin address, company registration fields), because the API reference does not document them. Confirm the activation flow in the sandbox before relying on it.
2. `users.create`, `users.login`, `users.resetPassword`, `whoisGuard.renew`, `ssl.create`, `ssl.renew` and `ssl.purchaseMoreSans` have undocumented response shapes. They return loosely typed results parsed tolerantly: they never throw on an unexpected shape, and fields that cannot be read are simply absent.
3. `dns.setEmailForwarding` sends `MailBox<n>` as spelled in the API reference; the Go SDK sends lowercase. This is unverified against the live API.
4. CAA (`Flag`/`Tag`) records are not supported by `dns.setHosts`.
5. `ssl.getInfo` accepts `returnCertificate` and sends it, but 1.0 does not parse the certificate body (its response shape is undocumented), so the result never contains the certificate.
6. WhoisGuard `allot`, `unallot` and `discard` are not implemented.
7. `domains.create` no longer exposes `idnCode`, the billing contact and `extendedAttributes`, which 0.6 did. IDN registrations and some ccTLDs (such as .us, .ca, .eu) need them, and the API reference does not document them. Unknown extra keys still pass through the serializer, so you can try a workaround such as `nc.domains.create({ ...params, ExtendedAttributes: "..." } as never)`, unverified against the live API.
8. Test fixtures marked `source: docs` or `source: go-namecheap-sdk` have not all been verified against the live sandbox. `scripts/record-fixtures.mjs` re-records them from a real sandbox account.

## Examples

[`examples/express`](./examples/express) is a REST bridge that exposes the client through Express routes and maps the three error classes to HTTP status codes. It is an example, not a service: it has no authentication.

## API coverage

59 commands, all reachable as `nc.<group>.<method>`.

The package also exports the command tables behind each group (`domainsCommands`, `dnsCommands`, and so on) for custom integrations. They are advanced API: they are not covered by semver stability, so prefer `nc.<group>.<method>`.

| Group (`nc.`)  | Methods                                                                                                                                                          | Count |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----: |
| `domains`      | `getList`, `check`, `getRegistrarLock`, `setRegistrarLock`, `reactivate`, `renew`, `setContacts`, `create`, `getTldList`, `getContacts`, `getInfo`               |    11 |
| `dns`          | `setDefault`, `setCustom`, `getList`, `getHosts`, `getEmailForwarding`, `setEmailForwarding`, `setHosts`                                                         |     7 |
| `ns`           | `create`, `delete`, `getInfo`, `update`                                                                                                                          |     4 |
| `transfer`     | `create`, `getStatus`, `updateStatus`, `getList`                                                                                                                 |     4 |
| `ssl`          | `create`, `getList`, `parseCSR`, `getApproverEmailList`, `activate`, `resendApproverEmail`, `reissue`, `resendFulfillmentEmail`, `editDCVMethod`, `getInfo`, `renew`, `purchaseMoreSans`, `revokeCertificate` | 13 |
| `users`        | `getBalances`, `getPricing`, `changePassword`, `update`, `createAddFundsRequest`, `getAddFundsStatus`, `create`, `login`, `resetPassword`                          |     9 |
| `usersAddress` | `create`, `delete`, `getInfo`, `getList`, `setDefault`, `update`                                                                                                  |     6 |
| `whoisGuard`   | `changeEmailAddress`, `enable`, `disable`, `getList`, `renew`                                                                                                    |     5 |

## Contributing and license

Issues and pull requests are welcome. The project uses Conventional Commits (`yarn commit` starts Commitizen) and semantic-release. Before opening a pull request run `yarn lint && yarn typecheck && yarn test --run --coverage && yarn build`.

Licensed under the [ISC license](./LICENSE).

## Attribution

Some test fixtures are copied or derived from [namecheap/go-namecheap-sdk](https://github.com/namecheap/go-namecheap-sdk), licensed under Apache-2.0. See [NOTICE](./NOTICE).
