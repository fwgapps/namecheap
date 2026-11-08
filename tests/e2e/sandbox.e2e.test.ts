import { afterAll, describe, expect, it } from "vitest";
import { NamecheapError, NamecheapHttpError, NamecheapParseError } from "../../src";
import { createSandboxClient, hasCredentials } from "./sandbox-client";

// E2E smoke tests against the real Namecheap SANDBOX, covering every command of the library.
// Run with: npm run test:e2e   (needs NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_CLIENT_IP in .env)
// Skipped automatically when the credentials are missing, so CI is unaffected.
//
// Two kinds of check:
//  - "ok":  read-only command, must succeed and be parsed into an object/array.
//  - "api": command that writes or needs data the account may not have. It is sent with
//           deliberately invalid or non-existent input so nothing real changes. The library is
//           healthy when the API either answers or rejects it with a NamecheapError. A
//           NamecheapParseError, NamecheapHttpError or TypeError means a bug in the library.

const MISSING = "not-my-domain-12345.com";
const NO_ID = 999999999;
const badContact = {
  firstName: "x",
  lastName: "x",
  address1: "x",
  city: "x",
  stateProvince: "x",
  postalCode: "x",
  country: "XX",
  phone: "x",
  emailAddress: "invalid",
};
const badAddress = {
  addressName: "e2e",
  emailAddress: "invalid",
  firstName: "x",
  lastName: "x",
  address1: "x",
  city: "x",
  stateProvince: "x",
  stateProvinceChoice: "S",
  zip: "x",
  country: "XX",
  phone: "x",
};

interface Case {
  name: string;
  mode: "ok" | "api";
  run: () => Promise<unknown>;
}

describe.skipIf(!hasCredentials)("sandbox e2e (all commands)", { timeout: 90_000 }, () => {
  const nc = createSandboxClient();
  const report: string[] = [];
  afterAll(() => console.log(`\nOutcome per command:\n${report.join("\n")}`));

  const cases: Case[] = [
    // --- users
    { name: "users.getBalances", mode: "ok", run: () => nc.users.getBalances() },
    {
      name: "users.getPricing",
      mode: "ok",
      run: () => nc.users.getPricing({ productType: "DOMAIN", productCategory: "DOMAINS" }),
    },
    {
      name: "users.update",
      mode: "api",
      run: () =>
        nc.users.update({
          ...badContact,
          zip: "x",
          phone: "x",
        }),
    },
    {
      name: "users.createAddFundsRequest",
      mode: "api",
      run: () =>
        nc.users.createAddFundsRequest({
          paymentType: "Creditcard",
          amount: 0,
          returnUrl: "https://example.com/",
        }),
    },
    {
      name: "users.getAddFundsStatus",
      mode: "api",
      run: () => nc.users.getAddFundsStatus({ tokenId: "invalid" }),
    },
    {
      name: "users.create",
      mode: "api",
      run: () =>
        nc.users.create({
          newUserName: "x",
          newUserPassword: "x",
          emailAddress: "invalid",
          firstName: "x",
          lastName: "x",
          acceptTerms: 0,
          address1: "x",
          city: "x",
          stateProvince: "x",
          zip: "x",
          country: "XX",
          phone: "x",
        }),
    },
    // users.login is NOT exercised: a wrong password counts as a failed login, and three in a
    // row lock the ApiUser for 24 hours (error 1017411). Covered by the unit fixtures only.
    // users.login, users.changePassword and users.resetPassword are never sent as the main
    // account (see sandbox-client.ts); the flow suite covers them on the E2E account.

    // --- users.address
    { name: "usersAddress.getList", mode: "ok", run: () => nc.usersAddress.getList() },
    {
      name: "usersAddress.getInfo",
      mode: "api",
      run: () => nc.usersAddress.getInfo({ addressId: NO_ID }),
    },
    { name: "usersAddress.create", mode: "api", run: () => nc.usersAddress.create(badAddress) },
    {
      name: "usersAddress.update",
      mode: "api",
      run: () => nc.usersAddress.update({ ...badAddress, addressId: NO_ID }),
    },
    {
      name: "usersAddress.setDefault",
      mode: "api",
      run: () => nc.usersAddress.setDefault({ addressId: NO_ID }),
    },
    {
      name: "usersAddress.delete",
      mode: "api",
      run: () => nc.usersAddress.delete({ addressId: NO_ID }),
    },

    // --- domains
    {
      name: "domains.getList",
      mode: "ok",
      run: () => nc.domains.getList({ page: 1, pageSize: 20 }),
    },
    {
      name: "domains.check",
      mode: "ok",
      run: () =>
        nc.domains.check({ domainList: "example-not-real-12345.com,example-not-real-12345.net" }),
    },
    { name: "domains.getTldList", mode: "ok", run: () => nc.domains.getTldList() },
    {
      name: "domains.getInfo (missing)",
      mode: "api",
      run: () => nc.domains.getInfo({ domainName: MISSING }),
    },
    {
      name: "domains.getContacts (missing)",
      mode: "api",
      run: () => nc.domains.getContacts({ domainName: MISSING }),
    },
    {
      name: "domains.getRegistrarLock (missing)",
      mode: "api",
      run: () => nc.domains.getRegistrarLock({ domainName: MISSING }),
    },
    {
      name: "domains.setRegistrarLock (missing)",
      mode: "api",
      run: () => nc.domains.setRegistrarLock({ domainName: MISSING, lockAction: "LOCK" }),
    },
    {
      name: "domains.setContacts (missing)",
      mode: "api",
      run: () =>
        nc.domains.setContacts({
          domainName: MISSING,
          registrant: badContact,
          tech: badContact,
          admin: badContact,
          auxBilling: badContact,
        }),
    },
    {
      name: "domains.renew (missing)",
      mode: "api",
      run: () => nc.domains.renew({ domainName: MISSING, years: 1 }),
    },
    {
      name: "domains.reactivate (missing)",
      mode: "api",
      run: () => nc.domains.reactivate({ domainName: MISSING }),
    },
    {
      name: "domains.create (invalid name)",
      mode: "api",
      run: () =>
        nc.domains.create({
          domainName: "invalid",
          years: 1,
          registrant: badContact,
          tech: badContact,
          admin: badContact,
          auxBilling: badContact,
        }),
    },

    // --- dns
    {
      name: "dns.getList (missing)",
      mode: "api",
      run: () => nc.dns.getList({ sld: "not-my-domain-12345", tld: "com" }),
    },
    {
      name: "dns.getHosts (missing)",
      mode: "api",
      run: () => nc.dns.getHosts({ sld: "not-my-domain-12345", tld: "com" }),
    },
    {
      name: "dns.getEmailForwarding (missing)",
      mode: "api",
      run: () => nc.dns.getEmailForwarding({ domainName: MISSING }),
    },
    {
      name: "dns.setEmailForwarding (missing)",
      mode: "api",
      run: () => nc.dns.setEmailForwarding({ domainName: MISSING, forwards: [] }),
    },
    {
      name: "dns.setDefault (missing)",
      mode: "api",
      run: () => nc.dns.setDefault({ sld: "not-my-domain-12345", tld: "com" }),
    },
    {
      name: "dns.setCustom (missing)",
      mode: "api",
      run: () =>
        nc.dns.setCustom({
          sld: "not-my-domain-12345",
          tld: "com",
          nameservers: "ns1.example.com,ns2.example.com",
        }),
    },
    {
      name: "dns.setHosts (missing)",
      mode: "api",
      run: () =>
        nc.dns.setHosts({
          sld: "not-my-domain-12345",
          tld: "com",
          hosts: [{ hostName: "@", recordType: "A", address: "192.0.2.1" }],
        }),
    },

    // --- ns
    {
      name: "ns.getInfo (missing)",
      mode: "api",
      run: () =>
        nc.ns.getInfo({
          sld: "not-my-domain-12345",
          tld: "com",
          nameserver: "ns1.not-my-domain-12345.com",
        }),
    },
    {
      name: "ns.create (missing)",
      mode: "api",
      run: () =>
        nc.ns.create({
          sld: "not-my-domain-12345",
          tld: "com",
          nameserver: "ns1.not-my-domain-12345.com",
          ip: "192.0.2.1",
        }),
    },
    {
      name: "ns.update (missing)",
      mode: "api",
      run: () =>
        nc.ns.update({
          sld: "not-my-domain-12345",
          tld: "com",
          nameserver: "ns1.not-my-domain-12345.com",
          oldIP: "192.0.2.1",
          ip: "192.0.2.2",
        }),
    },
    {
      name: "ns.delete (missing)",
      mode: "api",
      run: () =>
        nc.ns.delete({
          sld: "not-my-domain-12345",
          tld: "com",
          nameserver: "ns1.not-my-domain-12345.com",
        }),
    },

    // --- transfer
    { name: "transfer.getList", mode: "ok", run: () => nc.transfer.getList() },
    {
      name: "transfer.getStatus",
      mode: "api",
      run: () => nc.transfer.getStatus({ transferID: NO_ID }),
    },
    {
      name: "transfer.updateStatus",
      mode: "api",
      run: () => nc.transfer.updateStatus({ transferID: NO_ID, resubmit: true }),
    },
    {
      name: "transfer.create (invalid name)",
      mode: "api",
      run: () => nc.transfer.create({ domainName: "invalid", years: 1, eppCode: "invalid" }),
    },

    // --- ssl
    { name: "ssl.getList", mode: "ok", run: () => nc.ssl.getList() },
    { name: "ssl.getInfo", mode: "api", run: () => nc.ssl.getInfo({ certificateID: NO_ID }) },
    { name: "ssl.parseCSR", mode: "api", run: () => nc.ssl.parseCSR({ csr: "invalid" }) },
    {
      name: "ssl.getApproverEmailList",
      mode: "api",
      run: () =>
        nc.ssl.getApproverEmailList({ domainName: MISSING, certificateType: "InvalidType" }),
    },
    {
      name: "ssl.create (invalid type)",
      mode: "api",
      run: () => nc.ssl.create({ years: 1, type: "InvalidType" }),
    },
    {
      name: "ssl.activate",
      mode: "api",
      run: () =>
        nc.ssl.activate({ certificateID: NO_ID, csr: "invalid", adminEmailAddress: "invalid" }),
    },
    {
      name: "ssl.reissue",
      mode: "api",
      run: () => nc.ssl.reissue({ certificateID: NO_ID, csr: "invalid" }),
    },
    {
      name: "ssl.resendApproverEmail",
      mode: "api",
      run: () => nc.ssl.resendApproverEmail({ certificateID: NO_ID }),
    },
    {
      name: "ssl.resendFulfillmentEmail",
      mode: "api",
      run: () => nc.ssl.resendFulfillmentEmail({ certificateID: NO_ID }),
    },
    {
      name: "ssl.editDCVMethod",
      mode: "api",
      run: () => nc.ssl.editDCVMethod({ certificateID: NO_ID, dcvMethod: "invalid" }),
    },
    {
      name: "ssl.renew",
      mode: "api",
      run: () => nc.ssl.renew({ certificateID: NO_ID, years: 1, sslType: "InvalidType" }),
    },
    {
      name: "ssl.purchaseMoreSans",
      mode: "api",
      run: () => nc.ssl.purchaseMoreSans({ certificateID: NO_ID, numberOfSansToAdd: 1 }),
    },
    {
      name: "ssl.revokeCertificate",
      mode: "api",
      run: () => nc.ssl.revokeCertificate({ certificateID: NO_ID, certificateType: "InvalidType" }),
    },

    // --- whoisGuard
    { name: "whoisGuard.getList", mode: "ok", run: () => nc.whoisGuard.getList() },
    {
      name: "whoisGuard.changeEmailAddress",
      mode: "api",
      run: () => nc.whoisGuard.changeEmailAddress({ whoisguardID: NO_ID }),
    },
    {
      name: "whoisGuard.enable",
      mode: "api",
      run: () => nc.whoisGuard.enable({ whoisguardID: NO_ID, forwardedToEmail: "invalid" }),
    },
    {
      name: "whoisGuard.disable",
      mode: "api",
      run: () => nc.whoisGuard.disable({ whoisguardID: NO_ID }),
    },
    {
      name: "whoisGuard.renew",
      mode: "api",
      run: () => nc.whoisGuard.renew({ whoisguardID: NO_ID, years: 1 }),
    },
  ];

  it.each(cases)("$name ($mode)", async ({ name, mode, run }) => {
    const outcome = await run().then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );
    if ("error" in outcome) {
      const { error } = outcome;
      // Library bugs: unreadable response, transport failure or invalid arguments.
      expect(error, "library failed to handle the response").not.toBeInstanceOf(
        NamecheapParseError,
      );
      expect(error).not.toBeInstanceOf(NamecheapHttpError);
      expect(error, "expected a NamecheapError from the API").toBeInstanceOf(NamecheapError);
      expect(mode, `${name} must succeed but the API said: ${(error as Error).message}`).toBe(
        "api",
      );
      report.push(
        `  ${name}: API error ${(error as NamecheapError).code} (${(error as Error).message})`,
      );
    } else {
      expect(outcome.value).toBeTypeOf("object");
      expect(outcome.value).not.toBeNull();
      report.push(`  ${name}: OK`);
    }
  });

  it("domains.getInfo, getContacts, getRegistrarLock and dns.* work on an owned domain", async (ctx) => {
    const { domains } = await nc.domains.getList({ pageSize: 10 });
    const first = domains[0];
    if (!first) return ctx.skip();
    const [sld = "", ...rest] = first.name.split(".");
    const tld = rest.join(".");
    expect((await nc.domains.getInfo({ domainName: first.name })).domainName).toBe(first.name);
    expect(await nc.domains.getContacts({ domainName: first.name })).toBeTypeOf("object");
    expect(await nc.domains.getRegistrarLock({ domainName: first.name })).toBeTypeOf("object");
    expect((await nc.dns.getList({ sld, tld })).domain).toBe(first.name);
    expect((await nc.dns.getHosts({ sld, tld })).domain).toBe(first.name);
    expect(await nc.dns.getEmailForwarding({ domainName: first.name })).toBeTypeOf("object");
  });

  it("domains.getTldList includes com", async () => {
    expect((await nc.domains.getTldList()).some((t) => t.name === "com")).toBe(true);
  });
});
