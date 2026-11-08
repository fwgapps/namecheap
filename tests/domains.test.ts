import { describe, expect, it } from "vitest";
import { NamecheapError } from "../src";
import { domainsCommands } from "../src/commands/domains";
import { createTestClient, loadFixture, okEnvelope } from "./helpers";

const CONTACT_FIELDS = [
  "FirstName",
  "LastName",
  "Address1",
  "City",
  "StateProvince",
  "PostalCode",
  "Country",
  "Phone",
  "EmailAddress",
] as const;

/** Hand-written wire form of a contact: every value is `<Prefix>-<Field>`. */
function contactWire(prefix: string, extra: readonly string[] = []): Record<string, string> {
  return Object.fromEntries(
    [...CONTACT_FIELDS, ...extra].map((field) => [`${prefix}${field}`, `${prefix}-${field}`]),
  );
}

function contactParams(prefix: string, withOptional = false) {
  const value = (field: string) => `${prefix}-${field}`;
  return {
    firstName: value("FirstName"),
    lastName: value("LastName"),
    address1: value("Address1"),
    city: value("City"),
    stateProvince: value("StateProvince"),
    postalCode: value("PostalCode"),
    country: value("Country"),
    phone: value("Phone"),
    emailAddress: value("EmailAddress"),
    ...(withOptional
      ? {
          organizationName: value("OrganizationName"),
          jobTitle: value("JobTitle"),
          address2: value("Address2"),
        }
      : {}),
  };
}

const OPTIONAL_CONTACT_FIELDS = ["OrganizationName", "JobTitle", "Address2"] as const;

describe("domains", () => {
  it("getList sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "getList"));
    const result = await client.domains.getList({
      listType: "ALL",
      searchTerm: "domain",
      page: 1,
      pageSize: 20,
      sortBy: "NAME",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.getList");
    expect(calls[0]?.body.get("ListType")).toBe("ALL");
    expect(calls[0]?.body.get("SearchTerm")).toBe("domain");
    expect(calls[0]?.body.get("Page")).toBe("1");
    expect(calls[0]?.body.get("PageSize")).toBe("20");
    expect(calls[0]?.body.get("SortBy")).toBe("NAME");
    expect(result).toEqual({
      domains: [
        {
          id: 677625,
          name: "domain.com",
          user: "user",
          created: "06/02/2021",
          expires: "06/02/2022",
          isExpired: false,
          isLocked: false,
          autoRenew: true,
          whoisGuard: "ENABLED",
          isPremium: false,
          isOurDNS: false,
        },
        {
          id: 677626,
          name: "domain2.net",
          user: "user",
          created: "06/02/2021",
          expires: "06/02/2022",
          isExpired: false,
          isLocked: false,
          autoRenew: true,
          whoisGuard: "ENABLED",
          isPremium: false,
          isOurDNS: true,
        },
      ],
      paging: { totalItems: 2, currentPage: 1, pageSize: 20 },
    });
  });

  it("getList returns an empty list and still parses paging when there are no domains", async () => {
    const { client } = createTestClient(loadFixture("domains", "getList-empty"));
    const result = await client.domains.getList();
    expect(result).toEqual({
      domains: [],
      paging: { totalItems: 0, currentPage: 1, pageSize: 20 },
    });
  });

  it("check sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "check"));
    const result = await client.domains.check({ domainList: "example.com,example.net" });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.check");
    expect(calls[0]?.body.get("DomainList")).toBe("example.com,example.net");
    expect(result).toEqual([
      {
        domain: "example.com",
        available: true,
        errorNo: 0,
        description: "",
        isPremiumName: false,
        premiumRegistrationPrice: 0,
        premiumRenewalPrice: 0,
        premiumRestorePrice: 0,
        premiumTransferPrice: 0,
        icannFee: 0,
        eapFee: 0,
      },
      {
        domain: "example.net",
        available: false,
        errorNo: 0,
        description: "",
        isPremiumName: false,
        premiumRegistrationPrice: 0,
        premiumRenewalPrice: 0,
        premiumRestorePrice: 0,
        premiumTransferPrice: 0,
        icannFee: 0,
        eapFee: 0,
      },
    ]);
  });

  it("check returns a one-element array for a single DomainCheckResult", async () => {
    const { client } = createTestClient(loadFixture("domains", "check-single"));
    const result = await client.domains.check({ domainList: "example.com" });
    expect(result).toHaveLength(1);
    expect(result[0]?.domain).toBe("example.com");
    expect(result[0]?.available).toBe(true);
  });

  it("getRegistrarLock sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "getRegistrarLock"));
    const result = await client.domains.getRegistrarLock({ domainName: "example.com" });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.getRegistrarLock");
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    expect(result).toEqual({ domain: "example.com", registrarLockStatus: true });
  });

  it("setRegistrarLock sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "setRegistrarLock"));
    const result = await client.domains.setRegistrarLock({
      domainName: "example.com",
      lockAction: "UNLOCK",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.setRegistrarLock");
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    expect(calls[0]?.body.get("LockAction")).toBe("UNLOCK");
    expect(result).toEqual({ domain: "example.com", isSuccess: true });
  });

  it("reactivate sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "reactivate"));
    const result = await client.domains.reactivate({
      domainName: "example.com",
      promotionCode: "PROMO",
      yearsToAdd: 1,
      isPremiumDomain: true,
      premiumPrice: 650.78,
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.reactivate");
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    expect(calls[0]?.body.get("PromotionCode")).toBe("PROMO");
    expect(calls[0]?.body.get("YearsToAdd")).toBe("1");
    expect(calls[0]?.body.get("IsPremiumDomain")).toBe("true");
    expect(calls[0]?.body.get("PremiumPrice")).toBe("650.78");
    expect(result).toEqual({
      domain: "example.com",
      isSuccess: true,
      chargedAmount: 650.78,
      orderID: 23628,
      transactionID: 24581,
    });
  });

  it("renew sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "renew"));
    const result = await client.domains.renew({
      domainName: "terraform-provider.net",
      years: 2,
      promotionCode: "PROMO",
      isPremiumDomain: false,
      premiumPrice: 18.78,
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.renew");
    expect(calls[0]?.body.get("DomainName")).toBe("terraform-provider.net");
    expect(calls[0]?.body.get("Years")).toBe("2");
    expect(calls[0]?.body.get("PromotionCode")).toBe("PROMO");
    expect(calls[0]?.body.get("IsPremiumDomain")).toBe("false");
    expect(calls[0]?.body.get("PremiumPrice")).toBe("18.78");
    expect(result).toEqual({
      domainName: "terraform-provider.net",
      domainID: 838476,
      renew: true,
      orderID: 3666910,
      transactionID: 26781219,
      chargedAmount: 18.78,
      domainDetails: { expiredDate: "12/14/2034 1:01:07\u202fPM", numYears: 0 },
    });
  });

  it("setContacts sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "setContacts"));
    const result = await client.domains.setContacts({
      domainName: "example.com",
      registrant: contactParams("Registrant", true),
      tech: contactParams("Tech"),
      admin: contactParams("Admin"),
      auxBilling: contactParams("AuxBilling"),
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.setContacts");
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    const sent = Object.fromEntries(calls[0]?.body ?? []);
    expect(sent).toMatchObject({
      ...contactWire("Registrant", OPTIONAL_CONTACT_FIELDS),
      ...contactWire("Tech"),
      ...contactWire("Admin"),
      ...contactWire("AuxBilling"),
    });
    expect(result).toEqual({ domain: "example.com", isSuccess: true });
  });

  it("create sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "create"));
    const result = await client.domains.create({
      domainName: "example.com",
      years: 2,
      promotionCode: "PROMO",
      registrant: contactParams("Registrant", true),
      tech: contactParams("Tech"),
      admin: contactParams("Admin"),
      auxBilling: contactParams("AuxBilling"),
      nameservers: "ns1.example.com,ns2.example.com",
      addFreeWhoisguard: "Yes",
      wgEnabled: "No",
      isPremiumDomain: true,
      premiumPrice: 100,
      eapFee: 5,
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.create");
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    expect(calls[0]?.body.get("Years")).toBe("2");
    expect(calls[0]?.body.get("PromotionCode")).toBe("PROMO");
    expect(calls[0]?.body.get("Nameservers")).toBe("ns1.example.com,ns2.example.com");
    expect(calls[0]?.body.get("AddFreeWhoisguard")).toBe("Yes");
    expect(calls[0]?.body.get("WGEnabled")).toBe("No");
    expect(calls[0]?.body.get("IsPremiumDomain")).toBe("true");
    expect(calls[0]?.body.get("PremiumPrice")).toBe("100");
    expect(calls[0]?.body.get("EapFee")).toBe("5");
    expect(Object.fromEntries(calls[0]?.body ?? [])).toMatchObject({
      ...contactWire("Registrant", OPTIONAL_CONTACT_FIELDS),
      ...contactWire("Tech"),
      ...contactWire("Admin"),
      ...contactWire("AuxBilling"),
    });
    expect(result).toEqual({
      domain: "example.com",
      registered: true,
      chargedAmount: 10.87,
      domainID: 1234567,
      orderID: 987654,
      transactionID: 112233,
      whoisguardEnable: true,
      nonRealTimeDomain: false,
    });
  });

  it("create does not throw on a malformed fixture-only optional flag", async () => {
    const xml = loadFixture("domains", "create")
      .replace('WhoisguardEnable="true"', 'WhoisguardEnable="maybe"')
      .replace('NonRealTimeDomain="false"', 'NonRealTimeDomain="2"');
    const { client } = createTestClient(xml);
    const result = await client.domains.create({
      domainName: "example.com",
      years: 1,
      registrant: contactParams("Registrant", true),
      tech: contactParams("Tech"),
      admin: contactParams("Admin"),
      auxBilling: contactParams("AuxBilling"),
    });
    expect(result).toEqual({
      domain: "example.com",
      registered: true,
      chargedAmount: 10.87,
      domainID: 1234567,
      orderID: 987654,
      transactionID: 112233,
    });
  });

  it("getTldList sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "getTldList"));
    const result = await client.domains.getTldList();
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.getTldList");
    expect(result).toEqual([
      {
        name: "com",
        nonRealTimeDomain: false,
        minRegisterYears: 1,
        maxRegisterYears: 10,
        minRenewYears: 1,
        maxRenewYears: 10,
        minTransferYears: 1,
        maxTransferYears: 1,
        isApiRegisterable: true,
        isApiRenewable: true,
        isApiTransferable: false,
        isEppRequired: true,
        description: ".com domain",
      },
      {
        name: "net",
        nonRealTimeDomain: false,
        minRegisterYears: 1,
        maxRegisterYears: 10,
        minRenewYears: 1,
        maxRenewYears: 10,
        minTransferYears: 1,
        maxTransferYears: 1,
        isApiRegisterable: true,
        isApiRenewable: true,
        isApiTransferable: true,
        isEppRequired: false,
        description: ".net domain",
      },
    ]);
  });

  it("getContacts sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "getContacts"));
    const result = await client.domains.getContacts({ domainName: "example.com" });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.getContacts");
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    expect(result).toEqual({
      domain: "example.com",
      domainnameid: 30586,
      readonly: false,
      registrant: {
        organizationName: "NameCheap.com",
        jobTitle: "CEO",
        firstName: "John",
        lastName: "Smith",
        address1: "8939 S.cross Blvd",
        address2: "Suite 600",
        city: "Phoenix",
        stateProvince: "AZ",
        postalCode: "85284",
        country: "US",
        phone: "+1.6613102107",
        emailAddress: "john@example.com",
      },
      tech: { firstName: "Tech", lastName: "Person", emailAddress: "tech@example.com" },
      admin: { firstName: "Admin", lastName: "Person" },
      auxBilling: { firstName: "Billing", lastName: "Person" },
    });
  });

  it("getInfo sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("domains", "getInfo"));
    const result = await client.domains.getInfo({
      domainName: "horse-family.com.ua",
      hostName: "horse-family.com.ua",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.getInfo");
    expect(calls[0]?.body.get("DomainName")).toBe("horse-family.com.ua");
    expect(calls[0]?.body.get("HostName")).toBe("horse-family.com.ua");
    expect(result).toEqual({
      id: 1706717,
      domainName: "horse-family.com.ua",
      ownerName: "NCStaffvladlenf",
      isOwner: false,
      isPremium: false,
      domainDetails: { createdDate: "11/26/2021", numYears: 0 },
      whoisguard: { enabled: "NotAlloted", id: 0 },
      premiumDnsSubscription: {
        useAutoRenew: false,
        subscriptionId: -1,
        createdDate: "0001-01-01T00:00:00",
        expirationDate: "0001-01-01T00:00:00",
        isActive: false,
      },
      dnsDetails: {
        providerType: "FreeDNS",
        isUsingOurDNS: true,
        hostCount: 0,
        emailType: "No Email Service",
        dynamicDNSStatus: false,
        isFailover: false,
        nameservers: [
          "freedns1.registrar-servers.com",
          "freedns2.registrar-servers.com",
          "freedns3.registrar-servers.com",
          "freedns4.registrar-servers.com",
          "freedns5.registrar-servers.com",
        ],
      },
      modificationrights: { rights: [] },
    });
  });

  it("getInfo parses the optional status, expiry, privacy email and modification rights", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
  <Errors />
  <RequestedCommand>namecheap.domains.getinfo</RequestedCommand>
  <CommandResponse Type="namecheap.domains.getInfo">
    <DomainGetInfoResult Status="Ok" ID="7" DomainName="a.com" OwnerName="me" IsOwner="true" IsPremium="false">
      <DomainDetails><CreatedDate>01/02/2020</CreatedDate><ExpiredDate>01/02/2030</ExpiredDate><NumYears>3</NumYears></DomainDetails>
      <LockDetails />
      <Whoisguard Enabled="True">
        <ID>55</ID>
        <ExpiredDate>01/02/2031</ExpiredDate>
        <EmailDetails WhoisGuardEmail="x@whoisguard.com" ForwardedTo="me@example.com" LastAutoEmailChangeDate="" AutoEmailChangeFrequencyDays="30" />
      </Whoisguard>
      <PremiumDnsSubscription><UseAutoRenew>true</UseAutoRenew><SubscriptionId>9</SubscriptionId><CreatedDate>2020-01-02T00:00:00</CreatedDate><ExpirationDate>2030-01-02T00:00:00</ExpirationDate><IsActive>true</IsActive></PremiumDnsSubscription>
      <DnsDetails ProviderType="PremiumDNS" IsUsingOurDNS="true" HostCount="2" EmailType="MX" DynamicDNSStatus="true" IsFailover="true"><Nameserver>ns1.example.com</Nameserver></DnsDetails>
      <Modificationrights All="true"><Rights Type="dns">OK</Rights><Rights Type="rlock">OK</Rights></Modificationrights>
    </DomainGetInfoResult>
  </CommandResponse>
</ApiResponse>`;
    const { client } = createTestClient(xml);
    const result = await client.domains.getInfo({ domainName: "a.com" });
    expect(result.status).toBe("Ok");
    expect(result.domainDetails).toEqual({
      createdDate: "01/02/2020",
      expiredDate: "01/02/2030",
      numYears: 3,
    });
    expect(result.whoisguard).toEqual({
      enabled: "True",
      id: 55,
      expiredDate: "01/02/2031",
      emailDetails: {
        whoisGuardEmail: "x@whoisguard.com",
        forwardedTo: "me@example.com",
        lastAutoEmailChangeDate: "",
        autoEmailChangeFrequencyDays: 30,
      },
    });
    expect(result.premiumDnsSubscription.useAutoRenew).toBe(true);
    expect(result.dnsDetails.nameservers).toEqual(["ns1.example.com"]);
    expect(result.modificationrights).toEqual({
      all: true,
      rights: [
        { type: "dns", value: "OK" },
        { type: "rlock", value: "OK" },
      ],
    });
  });

  it("rejects with NamecheapError carrying the code and message of an error response", async () => {
    const { client } = createTestClient(loadFixture("domains", "error"));
    const error = await client.domains.getContacts({ domainName: "missing.com" }).catch((e) => e);
    expect(error).toBeInstanceOf(NamecheapError);
    expect((error as NamecheapError).code).toBe(2019166);
    expect((error as NamecheapError).message).toBe("Domain not found");
  });

  it("names every command after its key", () => {
    for (const [key, command] of Object.entries(domainsCommands)) {
      expect(command.name.split(".").at(-1)?.toLowerCase()).toBe(key.toLowerCase());
    }
    expect(Object.keys(domainsCommands).sort()).toEqual(
      [
        "check",
        "create",
        "getContacts",
        "getInfo",
        "getList",
        "getRegistrarLock",
        "getTldList",
        "reactivate",
        "renew",
        "setContacts",
        "setRegistrarLock",
      ].sort(),
    );
  });

  it("check does not require the fixture-only ErrorNo and Description attributes", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
  <Errors />
  <RequestedCommand>namecheap.domains.check</RequestedCommand>
  <CommandResponse Type="namecheap.domains.check">
    <DomainCheckResult Domain="example.com" Available="true" IsPremiumName="false" PremiumRegistrationPrice="0" PremiumRenewalPrice="0" PremiumRestorePrice="0" PremiumTransferPrice="0" IcannFee="0" EapFee="0" />
  </CommandResponse>
</ApiResponse>`;
    const { client } = createTestClient(xml);
    const result = await client.domains.check({ domainList: "example.com" });
    expect(result).toEqual([
      {
        domain: "example.com",
        available: true,
        isPremiumName: false,
        premiumRegistrationPrice: 0,
        premiumRenewalPrice: 0,
        premiumRestorePrice: 0,
        premiumTransferPrice: 0,
        icannFee: 0,
        eapFee: 0,
      },
    ]);
    expect(Object.keys(result[0] ?? {})).not.toContain("errorNo");
  });
});

describe("domains responses with optional elements absent", () => {
  const PAGING = `<Paging><TotalItems>0</TotalItems><CurrentPage>1</CurrentPage><PageSize>20</PageSize></Paging>`;

  it("getList returns an empty list when the result element is absent", async () => {
    const { client } = createTestClient(okEnvelope(PAGING, "namecheap.domains.getList"));
    await expect(client.domains.getList()).resolves.toEqual({
      domains: [],
      paging: { totalItems: 0, currentPage: 1, pageSize: 20 },
    });
  });

  it("getTldList returns an empty list when the Tlds element is absent", async () => {
    const { client } = createTestClient(okEnvelope("", "namecheap.domains.getTldList"));
    await expect(client.domains.getTldList()).resolves.toEqual([]);
  });

  it("getTldList reads NonRealTime, the attribute the live API sends", async () => {
    const { client } = createTestClient(
      okEnvelope(
        `<Tlds><Tld Name="com" NonRealTime="true" MinRegisterYears="1" MaxRegisterYears="10" MinRenewYears="1" MaxRenewYears="10" MinTransferYears="1" MaxTransferYears="1" IsApiRegisterable="true" IsApiRenewable="true" IsApiTransferable="false" IsEppRequired="true">.com domain</Tld></Tlds>`,
        "namecheap.domains.getTldList",
      ),
    );
    const [tld] = await client.domains.getTldList();
    expect(tld?.nonRealTimeDomain).toBe(true);
  });

  it("getContacts accepts a response without a root ReadOnly attribute, as the live API sends", async () => {
    const { client } = createTestClient(
      okEnvelope(
        `<DomainContactsResult Domain="example.com" domainnameid="7"><Registrant ReadOnly="false"><FirstName>Ana</FirstName></Registrant></DomainContactsResult>`,
        "namecheap.domains.getContacts",
      ),
    );
    const result = await client.domains.getContacts({ domainName: "example.com" });
    expect(result).not.toHaveProperty("readonly");
    expect(result.registrant?.firstName).toBe("Ana");
  });

  it("getContacts omits the contact blocks that the response does not carry", async () => {
    const { client } = createTestClient(
      okEnvelope(
        `<DomainContactsResult Domain="example.com" domainnameid="7" Readonly="false">
           <Registrant><FirstName>Ana</FirstName></Registrant>
         </DomainContactsResult>`,
        "namecheap.domains.getContacts",
      ),
    );
    const result = await client.domains.getContacts({ domainName: "example.com" });
    expect(result).toEqual({
      domain: "example.com",
      domainnameid: 7,
      readonly: false,
      registrant: { firstName: "Ana" },
    });
    for (const absent of ["tech", "admin", "auxBilling"]) {
      expect(result).not.toHaveProperty(absent);
    }
  });
});
