import { describe, expect, it } from "vitest";
import { NamecheapError } from "../../src";
import { createSandboxClient, hasCredentials } from "./sandbox-client";

// Success-path E2E in the SANDBOX: creates real (fake-money) objects and walks them through
// their lifecycle, asserting that every response is read into the documented shape.
// Registers one throw-away domain per run (sandbox domains cannot be deleted).
//
// users.login and users.changePassword never touch the real account: the test first creates a
// throw-away account with users.create (known password), then acts on it by passing its name as
// `userName` while keeping the same ApiUser/ApiKey. Even a failed login can only lock that
// throw-away account, never the ApiUser from .env.
// Both come from .env (NAMECHEAP_E2E_USER / NAMECHEAP_E2E_PASS); the users tests are skipped without them.
const e2eUser = process.env.NAMECHEAP_E2E_USER ?? "";
const password = process.env.NAMECHEAP_E2E_PASS ?? "";
// A public CSR for e2e-test.example.com, generated once with openssl; its private key was discarded.
const CSR = `-----BEGIN CERTIFICATE REQUEST-----
MIICozCCAYsCAQAwXjELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMRQwEgYDVQQH
DAtMb3MgQW5nZWxlczENMAsGA1UECgwEVGVzdDEdMBsGA1UEAwwUZTJlLXRlc3Qu
ZXhhbXBsZS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCWks8j
Ns/X1I9wF3sB09d4Kzr3al7butAFeFgjugagVtW6TPIW7d8IspkYrzGcK5tJh6xo
c7ycCwQRLTLMAbj1QrNh3UbanJuWHccJrLn1baI68D/Jdm+CDAA/DZpN50gGvkly
bPojzcEaXRWY65VqNamoq+lfQQ0bC3U0c8NHdWtxbICPwJzMsbF53S1PX8dZYi3K
/hmU08vzqPpiBt7uRLl8HdMsJqjif/eBwS3gxfX5ZHit3Ym2NqxOsc9nj0pKxvBa
X7wCiCVs/K3Pj3oMJfH645LJCiTuxIuj5+buFnNNG9Wu6WlgZa5QdPAPH0rL6WlM
49oAylHJzMJqD8PBAgMBAAGgADANBgkqhkiG9w0BAQsFAAOCAQEAUmQD+dyua5jL
eU5RQiGzdaHJM6thkSU/h8rMU+NWY3cy3CbiV3J1010FtuhPLOgkq1GL1+UO691C
8HoDRonjfOxhMZaTyyVMgAUrc+dos1gFGaQgZlsxU/TImA6Gw4X1USf8IAUo1Usb
Ggn5sX/AAvEArviDCIZwl3yVvy6q/iAxJSYhCfuJJUlBWgQ87wYUTF4NEr/NXq3Z
BQRnCveG2H45+wte45EXZkXeuZXvlrKR2y0OE/khj4FuEMavHqtpaN9kYfKWiYEl
6Td0DJmz8BQza3THdTqVEFQI/qMwc+c84iSHy3xzyfnd7Bw8lOwrR9IGBVocQcP9
/HcTH7UjRw==
-----END CERTIFICATE REQUEST-----`;
const stamp = Date.now();

/**
 * Runs a command that may legitimately be refused for business reasons (e.g. a certificate that
 * is not issued yet). A NamecheapError is reported and tolerated; a parse error, an HTTP error
 * or a TypeError still fails the test, because those are library bugs.
 */
async function tolerant<T>(name: string, run: () => Promise<T>): Promise<T | undefined> {
  try {
    const value = await run();
    process.stderr.write(`  ${name}: OK
`);
    return value;
  } catch (error) {
    if (!(error instanceof NamecheapError)) throw error;
    process.stderr.write(`  ${name}: API error ${error.code} (${error.message})
`);
    return undefined;
  }
}
const domain = `e2e${stamp}.com`;
const [sld, tld] = [`e2e${stamp}`, "com"];

const contact = {
  firstName: "Test",
  lastName: "Sandbox",
  address1: "1 Test Street",
  city: "Los Angeles",
  stateProvince: "CA",
  postalCode: "90001",
  country: "US",
  phone: "+1.3105551234",
  emailAddress: "e2e-test@example.com",
};
const address = {
  addressName: `e2e${stamp % 1e9}`,
  emailAddress: "e2e-test@example.com",
  firstName: "Test",
  lastName: "Sandbox",
  address1: "1 Test Street",
  city: "Los Angeles",
  stateProvince: "CA",
  stateProvinceChoice: "S",
  zip: "90001",
  country: "US",
  phone: "+1.3105551234",
};

describe.skipIf(!hasCredentials)("sandbox e2e flows (writes)", { timeout: 120_000 }, () => {
  const nc = createSandboxClient();
  const state: { addressId?: number; domainRegistered?: boolean; whoisguardId?: number } = {};

  describe("users.address", () => {
    it("create, getInfo, update, setDefault, getList, delete", async () => {
      const created = await nc.usersAddress.create(address);
      expect(created.success).toBe(true);
      const addressId = created.addressId;
      expect(addressId).toBeGreaterThan(0);
      expect((await nc.usersAddress.getInfo({ addressId })).addressId).toBe(addressId);
      const updated = await nc.usersAddress.update({ ...address, addressId, city: "San Diego" });
      expect(updated.success).toBe(true);
      expect((await nc.usersAddress.setDefault({ addressId })).success).toBe(true);
      const list = await nc.usersAddress.getList();
      expect(JSON.stringify(list)).toContain(String(addressId));
      // Put the primary address back as default so deleting ours is allowed.
      await nc.usersAddress.setDefault({ addressId: 0 });
      expect((await nc.usersAddress.delete({ addressId })).success).toBe(true);
    });
  });

  describe("domains", () => {
    it("check says the new name is available", async () => {
      const [item] = await nc.domains.check({ domainList: domain });
      expect(item?.available).toBe(true);
    });

    it("create registers the domain", async () => {
      const result = await nc.domains.create({
        domainName: domain,
        years: 1,
        registrant: contact,
        tech: contact,
        admin: contact,
        auxBilling: contact,
        addFreeWhoisguard: "yes",
        wgEnabled: "yes",
      });
      expect(result.registered).toBe(true);
      expect(result.domain).toBe(domain);
      expect(result.domainID).toBeGreaterThan(0);
      state.domainRegistered = true;
    });

    it("shows up in getList and getInfo / getContacts / getRegistrarLock", async (ctx) => {
      if (!state.domainRegistered) return ctx.skip();
      const list = await nc.domains.getList({ searchTerm: domain });
      expect(list.domains.map((d) => d.name)).toContain(domain);
      expect((await nc.domains.getInfo({ domainName: domain })).domainName).toBe(domain);
      expect((await nc.domains.getContacts({ domainName: domain })).domain).toBe(domain);
      expect((await nc.domains.getRegistrarLock({ domainName: domain })).domain).toBe(domain);
    });

    it("setContacts and setRegistrarLock", async (ctx) => {
      if (!state.domainRegistered) return ctx.skip();
      const changed = { ...contact, city: "San Diego" };
      const set = await nc.domains.setContacts({
        domainName: domain,
        registrant: changed,
        tech: changed,
        admin: changed,
        auxBilling: changed,
      });
      expect(set.domain).toBe(domain);
      expect(
        await nc.domains.setRegistrarLock({ domainName: domain, lockAction: "UNLOCK" }),
      ).toBeTypeOf("object");
      expect(
        await nc.domains.setRegistrarLock({ domainName: domain, lockAction: "LOCK" }),
      ).toBeTypeOf("object");
    });

    it("renew charges and extends", async (ctx) => {
      if (!state.domainRegistered) return ctx.skip();
      const result = await nc.domains.renew({ domainName: domain, years: 1 });
      expect(result.renew).toBe(true);
    });
  });

  describe("dns and ns", () => {
    it("getList, setHosts, getHosts, setEmailForwarding, getEmailForwarding", async (ctx) => {
      if (!state.domainRegistered) return ctx.skip();
      expect((await nc.dns.getList({ sld, tld })).domain).toBe(domain);
      expect(
        await nc.dns.setHosts({
          sld,
          tld,
          hosts: [{ hostName: "@", recordType: "A", address: "192.0.2.1", ttl: 1800 }],
        }),
      ).toBeTypeOf("object");
      const hosts = await nc.dns.getHosts({ sld, tld });
      expect(hosts.hosts.some((h) => h.type === "A" && h.address === "192.0.2.1")).toBe(true);
      await nc.dns.setEmailForwarding({
        domainName: domain,
        forwards: [{ mailBox: "info", forwardTo: "e2e-test@example.com" }],
      });
      const forwarding = await nc.dns.getEmailForwarding({ domainName: domain });
      expect(forwarding.forwards.length).toBeGreaterThan(0);
    });

    it("setCustom then setDefault", async (ctx) => {
      if (!state.domainRegistered) return ctx.skip();
      expect(
        await nc.dns.setCustom({
          sld,
          tld,
          nameservers: "ns1.digitalocean.com,ns2.digitalocean.com",
        }),
      ).toBeTypeOf("object");
      expect(await nc.dns.setDefault({ sld, tld })).toBeTypeOf("object");
    });

    it("ns create, getInfo, update, delete", async (ctx) => {
      if (!state.domainRegistered) return ctx.skip();
      const nameserver = `ns1.${domain}`;
      expect(await nc.ns.create({ sld, tld, nameserver, ip: "8.8.8.8" })).toBeTypeOf("object");
      expect(await nc.ns.getInfo({ sld, tld, nameserver })).toBeTypeOf("object");
      expect(
        await nc.ns.update({ sld, tld, nameserver, oldIP: "8.8.8.8", ip: "1.1.1.1" }),
      ).toBeTypeOf("object");
      expect(await nc.ns.delete({ sld, tld, nameserver })).toBeTypeOf("object");
    });
  });

  describe("whoisGuard", () => {
    it("getList finds the subscription created with the domain", async (ctx) => {
      if (!state.domainRegistered) return ctx.skip();
      const { whoisguards } = await nc.whoisGuard.getList({ pageSize: 100 });
      const mine = whoisguards.find((w) => w.domainName === domain);
      if (!mine) return ctx.skip();
      state.whoisguardId = mine.id;
      expect(mine.id).toBeGreaterThan(0);
    });

    it("disable, enable, changeEmailAddress", async (ctx) => {
      if (state.whoisguardId === undefined) return ctx.skip();
      const whoisguardID = state.whoisguardId;
      // The domain is registered with free privacy already enabled, so switch it off first.
      expect(await nc.whoisGuard.disable({ whoisguardID })).toBeTypeOf("object");
      expect(
        await nc.whoisGuard.enable({ whoisguardID, forwardedToEmail: "e2e-test@example.com" }),
      ).toBeTypeOf("object");
      expect(await nc.whoisGuard.changeEmailAddress({ whoisguardID })).toBeTypeOf("object");
    });
  });

  describe("ssl", () => {
    it("create, getList, getInfo, getApproverEmailList", async () => {
      const created = await nc.ssl.create({ years: 1, type: "PositiveSSL" });
      const certificateID = created.certificateID;
      expect(certificateID).toBeGreaterThan(0);
      const list = await nc.ssl.getList();
      expect(list.certificates.length).toBeGreaterThan(0);
      expect(await nc.ssl.getInfo({ certificateID: certificateID ?? 0 })).toBeTypeOf("object");
      expect(
        await nc.ssl.getApproverEmailList({
          domainName: "example.com",
          certificateType: "PositiveSSL",
        }),
      ).toBeTypeOf("object");
    });
  });

  describe("ssl (remaining commands)", () => {
    it("parseCSR reads a valid CSR", async () => {
      expect(await nc.ssl.parseCSR({ csr: CSR })).toBeTypeOf("object");
    });

    it("activate, reissue, DCV, resend, renew, SANs and revoke on a real certificate", async () => {
      const created = await nc.ssl.create({ years: 1, type: "PositiveSSL" });
      const certificateID = created.certificateID ?? 0;
      expect(certificateID).toBeGreaterThan(0);
      await tolerant("ssl.activate", () =>
        nc.ssl.activate({ certificateID, csr: CSR, adminEmailAddress: "admin@example.com" }),
      );
      await tolerant("ssl.editDCVMethod", () =>
        nc.ssl.editDCVMethod({ certificateID, dcvMethod: "admin@example.com" }),
      );
      await tolerant("ssl.reissue", () =>
        nc.ssl.reissue({ certificateID, csr: CSR, adminEmailAddress: "admin@example.com" }),
      );
      await tolerant("ssl.resendApproverEmail", () =>
        nc.ssl.resendApproverEmail({ certificateID }),
      );
      await tolerant("ssl.resendFulfillmentEmail", () =>
        nc.ssl.resendFulfillmentEmail({ certificateID }),
      );
      await tolerant("ssl.purchaseMoreSans", () =>
        nc.ssl.purchaseMoreSans({ certificateID, numberOfSansToAdd: 1 }),
      );
      await tolerant("ssl.renew", () =>
        nc.ssl.renew({ certificateID, years: 1, sslType: "PositiveSSL" }),
      );
      await tolerant("ssl.revokeCertificate", () =>
        nc.ssl.revokeCertificate({ certificateID, certificateType: "PositiveSSL" }),
      );
    });
  });

  describe("transfer", () => {
    it("create, getStatus, updateStatus and getList", async () => {
      const created = await tolerant("transfer.create", () =>
        nc.transfer.create({ domainName: `e2e-xfer-${stamp}.com`, years: 1, eppCode: "Abc12345!" }),
      );
      const transferID = created?.transferID;
      expect((await nc.transfer.getList()).transfers).toBeInstanceOf(Array);
      if (transferID === undefined) return;
      await tolerant("transfer.getStatus", () => nc.transfer.getStatus({ transferID }));
      await tolerant("transfer.updateStatus", () =>
        nc.transfer.updateStatus({ transferID, resubmit: true }),
      );
    });
  });

  it("whoisGuard.renew on the domain subscription", async (ctx) => {
    if (state.whoisguardId === undefined) return ctx.skip();
    await tolerant("whoisGuard.renew", () =>
      nc.whoisGuard.renew({ whoisguardID: state.whoisguardId ?? 0, years: 1 }),
    );
  });

  describe.skipIf(!e2eUser || !password)("users", () => {
    // Same account on every run. The API has no command to delete a user, so the test reuses it:
    // if users.create says it already exists, we go on.
    const newUser = e2eUser;
    let created = false;

    it("create makes the E2E account, or finds it already there", async () => {
      const result = await nc.users
        .create({
          newUserName: newUser,
          newUserPassword: password,
          emailAddress: "e2e-test@example.com",
          ignoreDuplicateEmailAddress: "Yes",
          firstName: "Test",
          lastName: "Sandbox",
          acceptTerms: 1,
          address1: "1 Test Street",
          city: "Los Angeles",
          stateProvince: "CA",
          zip: "90001",
          country: "US",
          phone: "+1.3105551234",
        })
        // "Already exists" is the expected answer from the second run on; any other problem
        // shows up as a failed login in the next test.
        .catch((error: unknown) => {
          // Only "the name is taken" is acceptable; "not valid" and the like must fail the test.
          if (
            !(error instanceof NamecheapError) ||
            !/exist|already|taken|in use|duplicate/i.test(error.message)
          )
            throw error;
          return { alreadyExists: error.message };
        });
      expect(result).toBeTypeOf("object");
      created = true;
    });

    it("login on the E2E account", async (ctx) => {
      if (!created) return ctx.skip();
      const child = createSandboxClient(newUser);
      expect((await child.users.login({ password })).loginSuccess).toBe(true);
    });

    // Namecheap refuses to reuse an old password, so the password cannot be changed back. The
    // fixed account above is therefore never changed: changePassword runs once on a fresh
    // throw-away account instead (accounts cannot be deleted, so one is left behind per run).
    it("changePassword on a fresh throw-away account", async () => {
      const name = `fwge2e${stamp.toString(36)}`.slice(0, 20);
      const first = "E2e#Pass12345";
      await nc.users.create({
        newUserName: name,
        newUserPassword: first,
        emailAddress: `e2e-${stamp}@example.com`,
        ignoreDuplicateEmailAddress: "Yes",
        firstName: "Test",
        lastName: "Sandbox",
        acceptTerms: 1,
        address1: "1 Test Street",
        city: "Los Angeles",
        stateProvince: "CA",
        zip: "90001",
        country: "US",
        phone: "+1.3105551234",
      });
      const child = createSandboxClient(name);
      const result = await child.users.changePassword({
        oldPassword: first,
        newPassword: "E2e#Pass67890",
      });
      expect(result.success).toBe(true);
    });
  });
});
