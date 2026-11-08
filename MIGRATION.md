# Migrating from 0.6 to 1.0

Version 1.0 is a complete rewrite of `@fwgapps/namecheap`. It is not backwards compatible: property names, method signatures, result shapes, errors and the build outputs all changed. This guide maps every 0.6 method and type to its 1.0 equivalent.

## 1. What changed

- **Zero dependencies.** `fast-xml-parser` and `change-case-all` are gone; the XML parser is built in (no DTD or external entity support).
- **Node.js >= 20.** The library uses the global `fetch` and `AbortSignal.timeout`. Edge runtimes with `fetch` work too.
- **No IIFE/CDN build, no browser support.** See [section 6](#6-removed-browsercdn-build).
- **ESM and CJS** builds with `exports` map and separate `.d.ts` / `.d.cts` declarations.
- **POST transport.** Every command is a `POST` with an `application/x-www-form-urlencoded` body. The URL has no query string, so the API key never appears in it. (0.6 used GET with the credentials in the query string, and POST only for `setHosts` with more than 10 hosts and `ssl.parseCSR`.)
- **Error classes.** Failures are `NamecheapError`, `NamecheapHttpError` or `NamecheapParseError` instances ([section 5](#5-error-handling)).
- **Typed values.** Booleans and numbers in results are real `boolean` and `number` values (the parser never coerces; commands read fields with typed accessors). Result objects are flattened and renamed per command, see the method table.
- **Tolerant parsing of undocumented responses.** `users.create`, `users.login`, `users.resetPassword`, `whoisGuard.renew`, `ssl.create`, `ssl.renew` and `ssl.purchaseMoreSans` return loosely typed results and never throw on an unexpected shape.
- **`sandbox` is strictly boolean.** 0.6 treated any truthy value as the sandbox (`!isSandbox`), so an environment string such as `"true"` selected it. 1.0 accepts only `true` (sandbox), `false` or omitted (**production**), and throws a `TypeError` for anything else. Convert environment variables yourself: `sandbox: process.env.X === "true"`.
- **No automatic retries**, no logging, and a `timeoutMs` option.

## 2. Client and configuration

| 0.6                                | 1.0                                       |
| ---------------------------------- | ----------------------------------------- |
| `new Namecheap({ apiUser, apiKey, clientIp, sandbox, username? })` | `new Namecheap({ apiUser, apiKey, clientIp, userName?, sandbox?, fetch?, timeoutMs? })` |
| `username`                         | `userName` (renamed, still defaults to `apiUser`) |
| `sandbox` required, any truthy value = sandbox | `sandbox` optional boolean: `true` = sandbox, `false`/omitted = production, non-boolean throws `TypeError` |
| -                                  | `fetch` (inject a custom or fake fetch), `timeoutMs` |

### Renamed client properties

| 0.6                     | 1.0                    |
| ----------------------- | ---------------------- |
| `client.domains`        | `client.domains`       |
| `client.domainsDns`     | `client.dns`           |
| `client.domainsNs`      | `client.ns`            |
| `client.domainsTransfer`| `client.transfer`      |
| `client.ssl`            | `client.ssl`           |
| `client.users`          | `client.users`         |
| `client.usersAddress`   | `client.usersAddress`  |
| `client.whoIsGuard`     | `client.whoisGuard`    |
| `client.domainPrivacy` (getter alias of `whoIsGuard`) | removed, use `client.whoisGuard` |

## 3. Calling convention

In 0.6 identifiers were positional arguments and the rest was an options object. In 1.0 every method takes **one params object** whose keys mirror the Namecheap parameter names in camelCase. Methods whose parameters are all optional can be called with no argument.

```ts
// 0.6
await client.domainsDns.getHosts("example", "com");
await client.domains.renew("example.com", { years: 1 });

// 1.0
await client.dns.getHosts({ sld: "example", tld: "com" });
await client.domains.renew({ domainName: "example.com", years: 1 });
```

Certificate parameters are spelled `certificateID` in 1.0 (0.6: `certificateId`). Domain privacy parameters are spelled `whoisguardID` (0.6: `whoIsGuardId`).

## 4. Method mapping

Result shapes: "was `X`" refers to the 0.6 return type. Billed commands are marked (billed).

### domains

| 0.6 method | 1.0 method | Signature change | Result change |
| --- | --- | --- | --- |
| `domains.getList(params?)` | `domains.getList(params?)` | Same params object. 0.6 defaulted `listType`/`page`/`pageSize`; 1.0 sends only what you pass. | `{ data, paging }` becomes `{ domains, paging }`. Item field `isOurDns` becomes `isOurDNS`. |
| `domains.getContacts(domainName)` | `domains.getContacts({ domainName })` | Positional string becomes object. | Flattened to `{ domain, domainnameid, readonly, registrant?, tech?, admin?, auxBilling? }`. |
| `domains.create(domain, params)` (billed) | `domains.create({ domainName, years, registrant, tech, admin, auxBilling, ... })` | Domain moves into the params object. `addFreeWhoisguard` and `wgEnabled` are the strings `Yes`/`No`. 0.6 `promoCode` becomes `promotionCode` and `WGEnabled` becomes `wgEnabled`; the 0.6 `billing`, `idnCode` and `extendedAttributes` parameters are not supported in 1.0 (IDN and some ccTLDs need them; unknown extra keys still pass through the serializer as an unverified workaround). | Typed `{ domain, registered, chargedAmount, domainID, orderID, transactionID, whoisguardEnable?, nonRealTimeDomain? }`. |
| `domains.getTldList()` | `domains.getTldList()` | Unchanged. | Array of `DomainsTld` with typed numbers and booleans. |
| `domains.setContacts(domain, params)` | `domains.setContacts({ domainName, registrant, tech, admin, auxBilling })` | Domain moves into the params object. The 0.6 `extendedAttributes` parameter is not supported in 1.0. | Was `string`, now `{ domain, isSuccess }`. |
| `domains.check(domains[])` | `domains.check({ domainList })` | The array becomes a comma-separated string (`"a.com,b.com"`). | Array of `{ domain, available, isPremiumName, premium*Price, icannFee, eapFee, errorNo?, description? }` with real booleans and numbers. |
| `domains.reactivate(domain, params?)` (billed) | `domains.reactivate({ domainName, ... })` | Domain moves into the params object. | `{ domain, isSuccess, chargedAmount, orderID, transactionID }`. |
| `domains.renew(domain, params)` (billed) | `domains.renew({ domainName, years, ... })` | Domain moves into the params object. | `{ domainName, domainID, renew, chargedAmount, orderID, transactionID, domainDetails: { expiredDate, numYears } }`. |
| `domains.getRegistrarLock(domain)` | `domains.getRegistrarLock({ domainName })` | Positional string becomes object. | `{ domain, registrarLockStatus: boolean }`. |
| `domains.setRegistrarLock(domain, lockAction?)` | `domains.setRegistrarLock({ domainName, lockAction? })` | Positional args become object; `lockAction` is `"LOCK"` or `"UNLOCK"` (0.6 defaulted to LOCK, 1.0 sends what you pass). | Was `string`, now `{ domain, isSuccess }`. |
| `domains.getInfo(domain, hostName?)` | `domains.getInfo({ domainName, hostName? })` | Positional args become object. | Nested typed result (`domainDetails`, `whoisguard`, `premiumDnsSubscription`, `dnsDetails`, `modificationrights`). |

### dns (was `domainsDns`)

| 0.6 method | 1.0 method | Signature change | Result change |
| --- | --- | --- | --- |
| `domainsDns.setDefault(sld, tld)` | `dns.setDefault({ sld, tld })` | Positional becomes object. | Was `string`, now `{ domain, updated }`. |
| `domainsDns.setCustom(sld, tld, nameservers[])` | `dns.setCustom({ sld, tld, nameservers })` | The array becomes a comma-separated string. | Was `string`, now `{ domain, updated }`. |
| `domainsDns.getList(sld, tld)` | `dns.getList({ sld, tld })` | Positional becomes object. | `{ domain, isUsingOurDNS, nameservers: string[], isPremiumDNS?, isUsingFreeDNS? }`. |
| `domainsDns.getHosts(sld, tld)` | `dns.getHosts({ sld, tld })` | Positional becomes object. | `{ domain, isUsingOurDNS, hosts: DnsHost[], emailType? }`; host fields are `hostId`, `name`, `type`, `address`, `mxPref`, `ttl`. |
| `domainsDns.getEmailForwarding(domain)` | `dns.getEmailForwarding({ domainName })` | Positional string becomes object. | `{ domain, forwards: { mailbox, forwardTo? }[] }` (note the lowercase `mailbox` in results; `forwardTo` is optional). |
| `domainsDns.setEmailForwarding(domain, { mailBox[], forwardTo[] })` | `dns.setEmailForwarding({ domainName, forwards })` | Two parallel arrays become one list of `{ mailBox, forwardTo }` records. An empty list clears forwarding. | Was `string`, now `{ domain, isSuccess }`. |
| `domainsDns.setHosts(sld, tld, { hosts, emailType?, tag?, flag? })` | `dns.setHosts({ sld, tld, hosts, emailType? })` | Host fields renamed: `hostname` to `hostName`, `mxpref` (string) to `mxPref` (number), `recordType` and `address` and `ttl` unchanged. At least one host is required (empty list rejected). `tag` and `flag` (CAA) are not supported. `emailType` also accepts `"NONE"` and `"GMAIL"`. | Was `string[]`, now `{ domain, isSuccess, emailType? }`. |

### ns (was `domainsNs`)

| 0.6 method | 1.0 method | Signature change | Result change |
| --- | --- | --- | --- |
| `domainsNs.create(sld, tld, nameserver, ip)` | `ns.create({ sld, tld, nameserver, ip })` | Positional becomes object. | `{ domain, nameserver, ip, isSuccess }`. |
| `domainsNs.delete(sld, tld, nameserver)` | `ns.delete({ sld, tld, nameserver })` | Positional becomes object. | `{ domain, nameserver, isSuccess }`. |
| `domainsNs.getInfo(sld, tld, nameserver)` | `ns.getInfo({ sld, tld, nameserver })` | Positional becomes object. | `{ domain, nameserver, ip, nameserverStatuses? }`. |
| `domainsNs.update(sld, tld, nameserver, ip, oldIp)` | `ns.update({ sld, tld, nameserver, oldIP, ip })` | Positional becomes object; `oldIp` is renamed `oldIP`. | `{ domain, nameserver, isSuccess }`. |

### transfer (was `domainsTransfer`)

| 0.6 method | 1.0 method | Signature change | Result change |
| --- | --- | --- | --- |
| `domainsTransfer.create(domain, params)` (billed) | `transfer.create({ domainName, years, eppCode, promotionCode?, addFreeWhoisguard?, wgEnable? })` | Domain moves into the params object. `addFreeWhoisGuard`/`wGenable` booleans become the strings `addFreeWhoisguard`/`wgEnable` (`Yes`/`No`). | `{ domainName, transferID, statusID, orderID, transactionID, chargedAmount }`. |
| `domainsTransfer.getStatus(id)` | `transfer.getStatus({ transferID })` | Positional number becomes object. | `{ transferID, statusID, status }`. |
| `domainsTransfer.updateStatus(id, resubmit)` | `transfer.updateStatus({ transferID, resubmit })` | Positional becomes object. | Was `number`, now `{ transferID, resubmit }`. |
| `domainsTransfer.getList(params?)` | `transfer.getList(params?)` | Same params object; 1.0 sends only what you pass (0.6 defaulted `listType`, `page`, `pageSize`, `sortBy`). | `{ data, paging }` becomes `{ transfers, paging }`. |

### ssl

| 0.6 method | 1.0 method | Signature change | Result change |
| --- | --- | --- | --- |
| `ssl.create({ year, type, sansToADD?, promotionCode? })` (billed) | `ssl.create({ years, type, sansToAdd?, promotionCode? })` | `year` becomes `years`; `sansToADD` becomes `sansToAdd`; `type` is a plain string. | `{ isSuccess?, orderID?, transactionID?, chargedAmount?, certificateID?, created?, sslType?, status? }` (every field optional: the response shape is undocumented, so it is parsed tolerantly and never rejects after a charge). |
| `ssl.getList(params)` | `ssl.getList(params?)` | Params now optional. | Was `SSLResult[]`, now `{ certificates, paging }`. |
| `ssl.parseCSR(csr, certificateType?)` | `ssl.parseCSR({ csr, certificateType? })` | Positional becomes object. | `{ commonName, domainName, country, organisationUnit, organisation, state, locality, email }`. |
| `ssl.getApproverEmailList(domainName, certificateType?)` | `ssl.getApproverEmailList({ domainName, certificateType })` | Positional becomes object; `certificateType` is now required. | `{ domainEmails, genericEmails, manualEmails }` (string arrays). |
| `ssl.activate(certificateId, params)` | `ssl.activate({ certificateID, csr, adminEmailAddress, webServerType?, uniqueValue? })` | Certificate id moves into the params object and is renamed `certificateID`. The 0.6 DCV and OV/EV organisation option sets are not exposed (see the README's known gaps). | `{ id, isSuccess, httpDCValidation? }`. |
| `ssl.resendApproverEmail(certificateId)` | `ssl.resendApproverEmail({ certificateID })` | Positional becomes object. | Was `number`, now `{ id, isSuccess }`. |
| `ssl.getInfo(certificateId)` | `ssl.getInfo({ certificateID, returnCertificate?, returnType? })` | Positional becomes object; new optional params; the certificate body requested with `returnCertificate` is not parsed in 1.0 (undocumented response). | `{ certificateID, status, type?, commonName?, provider?, issuedOn?, expires? }`. |
| `ssl.renew(certificateId, params)` (billed) | `ssl.renew({ certificateID, years, sslType, promotionCode? })` | Certificate id moves into the params object. | `{ certificateID?, years?, orderID?, transactionID?, chargedAmount? }` (every field optional, parsed tolerantly). |
| `ssl.reissue(certificateId, params)` | `ssl.reissue({ certificateID, csr, adminEmailAddress?, webServerType?, uniqueValue? })` | Certificate id moves into the params object; the 0.6 DCV and OV/EV organisation option sets are not exposed (see the README's known gaps). | Same as `ssl.activate`: `{ id, isSuccess, httpDCValidation? }`. |
| `ssl.resendFulfillmentEmail(certificateId)` | `ssl.resendFulfillmentEmail({ certificateID })` | Positional becomes object. | Was `number`, now `{ id, isSuccess }`. |
| `ssl.purchaseMoreSANS(certificateId, numberOfSANSToAdd)` (billed) | `ssl.purchaseMoreSans({ certificateID, numberOfSansToAdd })` | Method renamed (`SANS` to `Sans`); positional becomes object. | `{ isSuccess?, orderID?, transactionID?, chargedAmount?, certificateID?, sslType?, sansCount? }` (every field optional, parsed tolerantly). |
| `ssl.revokeCertificate(certificateId, certificateType)` | `ssl.revokeCertificate({ certificateID, certificateType })` | Positional becomes object. | Was `number`, now `{ isSuccess, certificateID }`. |
| `ssl.editDCVMethod(certificateId, { DCVMethod, DNSNames, DCVMethods })` | `ssl.editDCVMethod({ certificateID, dcvMethod })` or `{ certificateID, dnsNames, dcvMethods }` | Params are a union: one method for the whole certificate, or per-domain lists. Casing is now camelCase. | Same as `ssl.activate`. |

### users

| 0.6 method | 1.0 method | Signature change | Result change |
| --- | --- | --- | --- |
| `users.getPricing(params)` | `users.getPricing({ productType, productCategory?, promotionCode?, actionName?, productName? })` | Same shape; enum values become plain strings (`"DOMAIN"`, `"REGISTER"`, ...). | `{ productTypes: [{ name, productCategories: [{ name, products: [{ name, prices }] }] }] }`; money values stay strings. |
| `users.getBalances()` | `users.getBalances()` | Unchanged. | `{ currency, availableBalance, accountBalance, earnedAmount, withdrawableAmount, fundsRequiredForAutoRenew }` (strings). |
| `users.changePassword(oldPassword, newPassword)` | `users.changePassword({ oldPassword, newPassword })` or `{ resetCode, newPassword }` | Positional becomes object; the reset-code variant is new. | Was `string`, now `{ success, userID }`. |
| `users.update(params)` | `users.update(params)` | Unchanged params. | Was `string`, now `{ success }`. |
| `users.createAddFundsRequest(username, params)` | `users.createAddFundsRequest({ paymentType, amount, returnUrl })` | The `username` argument is gone (the configured `userName` is used). `amount` may be a number or string. | `{ tokenID, redirectURL, returnURL }`. |
| `users.getAddFundsStatus(tokenId)` | `users.getAddFundsStatus({ tokenId })` | Positional becomes object. | `{ transactionID, amount, status }`; `status` is a plain string. |
| `users.create(params)` | `users.create({ newUserName, newUserPassword, emailAddress, firstName, lastName, acceptTerms, ... })` | Same idea; see the type for the full list. | Was `number`, now loosely typed `Record<string, string>` (undocumented response, parsed tolerantly). |
| `users.login(password)` | `users.login({ password })` | Positional becomes object. | Was `string`, now loosely typed `{ username?, loginSuccess? }`. |
| `users.resetPassword(params)` | `users.resetPassword({ findBy, findByValue, emailFromName?, emailFrom?, urlPattern? })` | Same params object. | Was `string`, now loosely typed `{ success? }`. |

### usersAddress

| 0.6 method | 1.0 method | Signature change | Result change |
| --- | --- | --- | --- |
| `usersAddress.create(params)` | `usersAddress.create(params)` | Same params object (`defaultYN`, `stateProvinceChoice`, ...). | `{ success, addressId, addressName }`. |
| `usersAddress.delete(addressId)` | `usersAddress.delete({ addressId })` | Positional becomes object. | `{ success, profileId, username? }`. |
| `usersAddress.getInfo(addressId)` | `usersAddress.getInfo({ addressId })` | Positional becomes object. | Flat typed object with `defaultYN: boolean`, `userName`, `addressName`, contact fields. |
| `usersAddress.getList()` | `usersAddress.getList()` | Unchanged. | Array of `{ addressId, addressName, isDefault }`. |
| `usersAddress.setDefault(addressId)` | `usersAddress.setDefault({ addressId })` | Positional becomes object. | Was `number`, now `{ success, addressId }`. |
| `usersAddress.update(addressId, params)` | `usersAddress.update({ addressId, ...params })` | Address id moves into the params object. | `{ success, addressId, addressName }`. |

### whoisGuard (was `whoIsGuard`)

| 0.6 method | 1.0 method | Signature change | Result change |
| --- | --- | --- | --- |
| `whoIsGuard.changeEmailAddress(whoIsGuardId)` | `whoisGuard.changeEmailAddress({ whoisguardID })` | Property and parameter renamed; positional becomes object. | `{ id, isSuccess, wgEmail, wgOldEmail }`. |
| `whoIsGuard.enable(whoIsGuardId, forwardedToEmail)` | `whoisGuard.enable({ whoisguardID, forwardedToEmail })` | Positional becomes object. | Was `string`, now `{ domainName, isSuccess }`. |
| `whoIsGuard.disable(whoIsGuardId)` | `whoisGuard.disable({ whoisguardID })` | Positional becomes object. | Was `string`, now `{ domainName, isSuccess }`. |
| `whoIsGuard.getList(params)` | `whoisGuard.getList(params?)` | Params now optional. | `{ data, paging }` becomes `{ whoisguards, paging }`; items are `{ id, domainName, created, expires, status }`. |
| `whoIsGuard.renew(whoIsGuardId: string, year, promotionCode?: number)` (billed) | `whoisGuard.renew({ whoisguardID, years, promotionCode? })` | `whoIsGuardId` (string) becomes numeric `whoisguardID`; `year` becomes `years`; `promotionCode` is a string. | Loosely typed (undocumented response): `{ whoisguardID?, years?, renew?, orderID?, transactionID?, chargedAmount? }` (reads both `OrderId` and `OrderID`). |

### Methods with no 1.0 equivalent

None of the 0.6 methods was removed. The `domainPrivacy` getter (alias of `whoIsGuard`) is gone; use `whoisGuard`. 1.0 adds no extra public methods beyond the 59 commands listed in the README.

## 5. Error handling

0.6 rejected with plain objects (`{ code, message }`) for API errors and with `Error` instances for everything else, so `instanceof` checks were impossible. 1.0 throws three `Error` subclasses:

- `NamecheapError`: the API answered `Status="ERROR"`. Has `code` (first error number) and `errors` (all `{ code, message }` items).
- `NamecheapHttpError`: network failure, timeout, redirect or non-2xx status. Has `status`, `statusText` and `cause`.
- `NamecheapParseError`: the body is not valid XML or lacks a documented field. When Namecheap answered OK but the response of a command could not be read, the message says the action may have been performed (the original error is the `cause`). After a billed or account-changing command, such an error or a `timeoutMs` abort means the outcome is unknown: reconcile with `getList`/`getInfo` before retrying.

Programmer or configuration mistakes (invalid `sandbox`, `dns.setHosts` validation, reserved parameter names) throw a plain `TypeError`.

```ts
// 0.6
try {
  await client.domainsDns.getHosts("example", "com");
} catch (error) {
  const err = error as { code?: number; message: string };
  if (err.code === 2019166) console.error("Domain not found");
}

// 1.0
import { NamecheapError, NamecheapHttpError } from "@fwgapps/namecheap";

try {
  await client.dns.getHosts({ sld: "example", tld: "com" });
} catch (error) {
  if (error instanceof NamecheapError && error.code === 2019166) {
    console.error("Domain not found");
  } else if (error instanceof NamecheapHttpError) {
    console.error(error.status);
  } else {
    throw error;
  }
}
```

There are still no automatic retries. HTTP 405 from Namecheap means rate limiting.

## 6. Removed browser/CDN build

0.6 shipped an IIFE bundle (`dist/index.global.js`, exposed through the `unpkg` and `jsdelivr` fields). It is gone, and the library is not meant to run in a browser: the API key must not reach a client, and Namecheap only accepts calls from allow-listed server IPs.

Alternatives:

- Call the library from your backend and expose only the operations you need to the browser. [`examples/express`](./examples/express) is a minimal REST bridge (add your own authentication).
- Use a serverless or edge function (Cloudflare Workers, Deno Deploy, ...) with a fixed egress IP that you whitelist at Namecheap.

## 7. Enums

0.6 exported const-object enums from `src/types/enum.ts`. 1.0 exports no runtime enums: parameters that had an enum are string-literal union types (or plain `string` where the API reference gives examples rather than a closed set). Replace `LockAction.Lock` with `"LOCK"`, and so on.

| 0.6 export | 1.0 equivalent |
| --- | --- |
| `RecordType` | `DnsRecordType` (type only): `"A" \| "AAAA" \| "ALIAS" \| "CAA" \| "CNAME" \| "MX" \| "MXE" \| "NS" \| "TXT" \| "URL" \| "URL301" \| "FRAME"` |
| `EmailType` | `DnsEmailType` (type only), now also `"NONE"` and `"GMAIL"` |
| `LockAction` | `DomainsLockAction` (type only): `"LOCK" \| "UNLOCK"` |
| `DomainListType` | `DomainsListType` (type only): `"ALL" \| "EXPIRING" \| "EXPIRED"` |
| `DomainListSortBy` | `DomainsSortBy` (type only): `"NAME" \| "NAME_DESC" \| "EXPIREDATE" \| "EXPIREDATE_DESC" \| "CREATEDATE" \| "CREATEDATE_DESC"` |
| `DomainTransferListType` | `TransferListType` (type only) |
| `DomainTransferSortBy` | `TransferSortBy` (type only) |
| `SSLListType` | `SslListType` (type only) |
| `SSLListSortBy` | `SslSortBy` (type only) |
| `UserPaymentType` | `UsersPaymentType` (type only): `"Creditcard"` |
| `UserListFindBy` | `UsersResetPasswordFindBy` (type only): `"EMAILADDRESS" \| "DOMAINNAME" \| "USERNAME"` |
| `WhoIsListType` | `WhoisguardListType` (type only): `"ALL" \| "ALLOTED" \| "FREE" \| "DISCARD"` |
| `SSLType` | Gone: `type`, `certificateType` and `sslType` are plain `string` (use the product names from the Namecheap reference, for example `"PositiveSSL"`) |
| `IdnCode` | Gone: `domains.create` no longer accepts `idnCode` |
| `UserProductType`, `UserProductCategory`, `UserActionName`, `UserProductName` | Gone: `users.getPricing` takes plain strings (for example `"DOMAIN"`, `"DOMAINS"`, `"REGISTER"`, `"COM"`) |
| `GetAddFundsStatus` | Gone: `users.getAddFundsStatus` returns `status` as a plain `string` |
| `DomainDnsTag` | Gone: CAA `Flag`/`Tag` records are not supported by `dns.setHosts` |

New in 1.0: `SslReturnType` (`"Individual" | "PKCS7"`), the error classes (`NamecheapError`, `NamecheapHttpError`, `NamecheapParseError`), the `NamecheapConfig` type, the command definition objects `domainsCommands`, `dnsCommands`, `nsCommands`, `transferCommands`, `sslCommands`, `usersCommands`, `usersAddressCommands` and `whoisGuardCommands` (advanced API, not covered by semver stability), the default and named `Namecheap` exports, and a `Params`/`Result` type for every command (for example `DnsSetHostsParams`, `DomainsGetListResult`).
