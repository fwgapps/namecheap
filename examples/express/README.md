# Express example for `@fwgapps/namecheap`

A thin REST bridge: one Express router per command group of the 1.0 API. Each route forwards to the SDK and returns the result as JSON. It shows how to wire the client, map the library errors to HTTP status codes and keep secrets out of URLs.

> **This is an example, not a service.** It has no authentication or rate limiting. Anyone who can reach it can spend your Namecheap balance (register, renew, transfer) and change your DNS. Do not expose it publicly.

> **Sandbox vs production.** The example talks to the Namecheap sandbox unless `ENV=PRODUCTION`. Production calls are billed and change real domains.

## Setup

The example depends on the local package (`"@fwgapps/namecheap": "file:../.."`), which resolves to the repository's `dist`. Build the library first:

```bash
# from the repository root
yarn install
yarn build

cd examples/express
yarn install
```

Create a `.env` file in `examples/express`:

```dotenv
API_USER=your_namecheap_username
API_KEY=your_api_key
CLIENT_IP=your_whitelisted_ip
# Optional: the account to act on, defaults to API_USER
USER_NAME=
# Sandbox unless set to PRODUCTION
ENV=DEV
```

`API_USER`, `API_KEY` and `CLIENT_IP` are required; the server refuses to start without them (the error names the missing variables, never their values). Optional: `PORT` (default 3000).

## Run

```bash
yarn dev          # ts-node-dev with auto-restart
yarn typecheck    # tsc --noEmit (alias: yarn build)
```

The server listens on http://localhost:3000.

## Routes

Reads use `GET` with path/query parameters, writes use `POST`/`PUT`/`DELETE` with a JSON body. Body fields are the SDK's parameter names (see the library types).

| Method | Path | SDK call |
| --- | --- | --- |
| GET | `/domains` | `domains.getList` (query: `listType`, `searchTerm`, `sortBy`, `page`, `pageSize`) |
| GET | `/domains/tld` | `domains.getTldList` |
| GET | `/domains/contacts/:domainName` | `domains.getContacts` |
| POST | `/domains/contacts` | `domains.setContacts` |
| GET | `/domains/info/:domainName` | `domains.getInfo` (query: `hostName`) |
| POST | `/domains/check` | `domains.check` (`{ domainList }`) |
| POST | `/domains/create` | `domains.create` |
| POST | `/domains/reactivate` | `domains.reactivate` |
| POST | `/domains/renew` | `domains.renew` |
| GET | `/domains/registrarLock/:domainName` | `domains.getRegistrarLock` |
| POST | `/domains/registrarLock` | `domains.setRegistrarLock` |
| GET | `/dns` | `dns.getList` (query: `sld`, `tld`) |
| GET | `/dns/hosts` | `dns.getHosts` (query: `sld`, `tld`) |
| POST | `/dns/hosts` | `dns.setHosts` (replaces the whole zone) |
| POST | `/dns/default` | `dns.setDefault` |
| POST | `/dns/custom` | `dns.setCustom` |
| GET | `/dns/emailForwarding` | `dns.getEmailForwarding` (query: `domainName`) |
| POST | `/dns/emailForwarding` | `dns.setEmailForwarding` |
| POST | `/ns` | `ns.create` |
| GET | `/ns` | `ns.getInfo` (query: `sld`, `tld`, `nameserver`) |
| PUT | `/ns` | `ns.update` |
| DELETE | `/ns` | `ns.delete` (query: `sld`, `tld`, `nameserver`) |
| POST | `/transfer` | `transfer.create` |
| GET | `/transfer` | `transfer.getList` |
| GET | `/transfer/status/:id` | `transfer.getStatus` |
| PUT | `/transfer/status/:id` | `transfer.updateStatus` (`{ resubmit }`) |
| POST | `/ssl` | `ssl.create` |
| GET | `/ssl` | `ssl.getList` |
| POST | `/ssl/parseCsr` | `ssl.parseCSR` (`{ csr, certificateType? }`) |
| GET | `/ssl/approverEmails/:domain` | `ssl.getApproverEmailList` (query: `certificateType`) |
| GET | `/ssl/info/:id` | `ssl.getInfo` |
| POST | `/ssl/activate/:id` | `ssl.activate` |
| POST | `/ssl/resendApproverEmail/:id` | `ssl.resendApproverEmail` |
| POST | `/ssl/resendFulfillmentEmail/:id` | `ssl.resendFulfillmentEmail` |
| POST | `/ssl/renew/:id` | `ssl.renew` |
| POST | `/ssl/reissue/:id` | `ssl.reissue` |
| POST | `/ssl/purchaseMoreSans/:id` | `ssl.purchaseMoreSans` (`{ numberOfSansToAdd }`) |
| POST | `/ssl/dcvMethod/:id` | `ssl.editDCVMethod` |
| DELETE | `/ssl/certificate/:id` | `ssl.revokeCertificate` (query: `certificateType`) |
| GET | `/users/balances` | `users.getBalances` |
| GET | `/users/pricing/:productType` | `users.getPricing` (query: `productCategory`, `actionName`, `productName`, `promotionCode`) |
| GET | `/users/addFundsStatus/:tokenId` | `users.getAddFundsStatus` |
| POST | `/users/addFundsRequest` | `users.createAddFundsRequest` |
| PUT | `/users` | `users.update` |
| PUT | `/users/password` | `users.changePassword` (body only) |
| POST | `/users` | `users.create` (body only) |
| POST | `/users/login` | `users.login` (body only) |
| POST | `/users/resetPassword` | `users.resetPassword` (body only) |
| GET | `/usersAddress` | `usersAddress.getList` |
| POST | `/usersAddress` | `usersAddress.create` |
| POST | `/usersAddress/default` | `usersAddress.setDefault` (`{ addressId }`) |
| GET | `/usersAddress/:id` | `usersAddress.getInfo` |
| PUT | `/usersAddress/:id` | `usersAddress.update` |
| DELETE | `/usersAddress/:id` | `usersAddress.delete` |
| GET | `/whois` | `whoisGuard.getList` (query: `listType`, `page`, `pageSize`) |
| PUT | `/whois/email` | `whoisGuard.changeEmailAddress` (`{ whoisguardID }`) |
| PUT | `/whois/enable/:id` | `whoisGuard.enable` (`{ forwardedToEmail }`) |
| DELETE | `/whois/disable/:id` | `whoisGuard.disable` |
| POST | `/whois/renew/:id` | `whoisGuard.renew` (`{ years, promotionCode? }`) |

Passwords and reset codes are only accepted in the JSON body, never in the query string.

## Error mapping

A single error middleware (`src/middleware/errors.ts`) answers every failure with `{ "error": { "code"?, "message" } }`:

| Error | Status | Notes |
| --- | --- | --- |
| `NamecheapError` (API answered `ERROR`) | 400 | `code` is the Namecheap error code |
| missing/invalid route parameter (`BadRequestError`, defined by this example) | 400 | no `code` |
| `NamecheapParseError`, `NamecheapHttpError` | 502 | upstream unreachable or unreadable |
| anything else | 500 | generic message; the real `name: message` is logged server-side |

Responses never include the request URL, request body or the API key. Unknown routes answer 404 with the same JSON shape.
