import { describe, expect, it } from "vitest";
import { NamecheapError } from "../src";
import { sslCommands } from "../src/commands/ssl";
import { createTestClient, loadFixture, okEnvelope } from "./helpers";

describe("ssl", () => {
  it("create sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "create"));
    const result = await client.ssl.create({
      years: 2,
      type: "PositiveSSL",
      sansToAdd: 3,
      promotionCode: "PROMO",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.create");
    expect(calls[0]?.body.get("Years")).toBe("2");
    expect(calls[0]?.body.get("Type")).toBe("PositiveSSL");
    expect(calls[0]?.body.get("SANStoADD")).toBe("3");
    expect(calls[0]?.body.get("PromotionCode")).toBe("PROMO");
    expect(result).toEqual({
      isSuccess: true,
      orderID: 11223344,
      transactionID: 55667788,
      chargedAmount: 9.98,
      certificateID: 123456,
      created: "09/22/2020",
      sslType: "PositiveSSL",
    });
  });

  it("getList sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "getList"));
    const result = await client.ssl.getList({
      listType: "Active",
      searchTerm: "example",
      page: 1,
      pageSize: 20,
      sortBy: "EXPIREDATETIME_DESC",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.getList");
    expect(calls[0]?.body.get("ListType")).toBe("Active");
    expect(calls[0]?.body.get("SearchTerm")).toBe("example");
    expect(calls[0]?.body.get("Page")).toBe("1");
    expect(calls[0]?.body.get("PageSize")).toBe("20");
    expect(calls[0]?.body.get("SortBy")).toBe("EXPIREDATETIME_DESC");
    expect(result).toEqual({
      certificates: [
        {
          certificateID: 123456,
          hostName: "example.com",
          sslType: "PositiveSSL",
          purchaseDate: "09/22/2020",
          expireDate: "09/22/2021",
          status: "Active",
        },
        {
          certificateID: 123457,
          hostName: "foo.example",
          sslType: "EV SSL",
          purchaseDate: "01/01/2021",
          expireDate: "01/01/2022",
          status: "Purchased",
        },
      ],
      paging: { totalItems: 2, currentPage: 1, pageSize: 20 },
    });
  });

  it("getList leaves status out when the response omits it and returns no certificates for an empty list", async () => {
    const withoutStatus = `<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
<Errors /><CommandResponse Type="namecheap.ssl.getList"><SSLListResult>
<SSL CertificateID="9" HostName="a.example" SSLType="PositiveSSL" PurchaseDate="01/01/2021" ExpireDate="01/01/2022" />
</SSLListResult><Paging><TotalItems>1</TotalItems><CurrentPage>1</CurrentPage><PageSize>20</PageSize></Paging></CommandResponse></ApiResponse>`;
    const first = await createTestClient(withoutStatus).client.ssl.getList();
    expect(first.certificates).toEqual([
      {
        certificateID: 9,
        hostName: "a.example",
        sslType: "PositiveSSL",
        purchaseDate: "01/01/2021",
        expireDate: "01/01/2022",
      },
    ]);
    const empty = `<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
<Errors /><CommandResponse Type="namecheap.ssl.getList"><Paging><TotalItems>0</TotalItems><CurrentPage>1</CurrentPage><PageSize>20</PageSize></Paging></CommandResponse></ApiResponse>`;
    const second = await createTestClient(empty).client.ssl.getList();
    expect(second).toEqual({
      certificates: [],
      paging: { totalItems: 0, currentPage: 1, pageSize: 20 },
    });
  });

  it("parseCSR sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "parseCSR"));
    const csr =
      "-----BEGIN CERTIFICATE REQUEST-----\nMIIB+line=\n-----END CERTIFICATE REQUEST-----";
    const result = await client.ssl.parseCSR({ csr, certificateType: "PositiveSSL" });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.parseCSR");
    expect(calls[0]?.body.get("csr")).toBe(csr);
    expect(calls[0]?.body.get("CertificateType")).toBe("PositiveSSL");
    expect(result).toEqual({
      commonName: "example.com",
      domainName: "example.com",
      country: "US",
      organisationUnit: "IT",
      organisation: "Example Inc",
      state: "CA",
      locality: "San Francisco",
      email: "[email protected]",
    });
  });

  it("getApproverEmailList sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "getApproverEmailList"));
    const result = await client.ssl.getApproverEmailList({
      domainName: "example.com",
      certificateType: "PositiveSSL",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.getApproverEmailList");
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    expect(calls[0]?.body.get("CertificateType")).toBe("PositiveSSL");
    expect(result).toEqual({
      domainEmails: ["[email protected]"],
      genericEmails: ["[email protected]", "[email protected]"],
      manualEmails: ["[email protected]"],
    });
  });

  it("activate sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "activate"));
    const csr =
      "-----BEGIN CERTIFICATE REQUEST-----\nMIIB+line=\n-----END CERTIFICATE REQUEST-----";
    const result = await client.ssl.activate({
      certificateID: 123456,
      csr,
      adminEmailAddress: "admin@example.com",
      webServerType: "nginx",
      uniqueValue: "unique1",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.activate");
    expect(calls[0]?.body.get("CertificateID")).toBe("123456");
    expect(calls[0]?.body.get("CSR")).toBe(csr);
    expect(calls[0]?.body.get("AdminEmailAddress")).toBe("admin@example.com");
    expect(calls[0]?.body.get("WebServerType")).toBe("nginx");
    expect(calls[0]?.body.get("UniqueValue")).toBe("unique1");
    expect(result).toEqual({
      id: 123456,
      isSuccess: true,
      httpDCValidation: {
        valueAvailable: true,
        fileName: "A1B2C3.txt",
        fileContent: "hash-content",
      },
    });
  });

  it("activate leaves httpDCValidation out when the response has none", async () => {
    const xml = `<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
<Errors /><CommandResponse Type="namecheap.ssl.activate"><SSLActivateResult ID="5" IsSuccess="true" /></CommandResponse></ApiResponse>`;
    const { client } = createTestClient(xml);
    const result = await client.ssl.activate({
      certificateID: 5,
      csr: "CSR",
      adminEmailAddress: "a@example.com",
    });
    expect(result).toEqual({ id: 5, isSuccess: true });
  });

  it("resendApproverEmail sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "resendApproverEmail"));
    const result = await client.ssl.resendApproverEmail({ certificateID: 123456 });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.resendApproverEmail");
    expect(calls[0]?.body.get("CertificateID")).toBe("123456");
    expect(result).toEqual({ id: 123456, isSuccess: true });
  });

  it("reissue sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "reissue"));
    const result = await client.ssl.reissue({
      certificateID: 123456,
      csr: "CSR-TEXT",
      adminEmailAddress: "admin@example.com",
      webServerType: "apacheopenssl",
      uniqueValue: "unique2",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.reissue");
    expect(calls[0]?.body.get("CertificateID")).toBe("123456");
    expect(calls[0]?.body.get("CSR")).toBe("CSR-TEXT");
    expect(calls[0]?.body.get("AdminEmailAddress")).toBe("admin@example.com");
    expect(calls[0]?.body.get("WebServerType")).toBe("apacheopenssl");
    expect(calls[0]?.body.get("UniqueValue")).toBe("unique2");
    expect(result).toEqual({
      id: 123456,
      isSuccess: true,
      httpDCValidation: { valueAvailable: true, fileName: "reissue.txt", fileContent: "hash" },
    });
  });

  it("resendFulfillmentEmail sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "resendFulfillmentEmail"));
    const result = await client.ssl.resendFulfillmentEmail({ certificateID: 123456 });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.resendfulfillmentemail");
    expect(calls[0]?.body.get("CertificateID")).toBe("123456");
    expect(result).toEqual({ id: 123456, isSuccess: true });
  });

  it("editDCVMethod sends a single method and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "editDCVMethod"));
    const result = await client.ssl.editDCVMethod({
      certificateID: 123456,
      dcvMethod: "HTTP_CSR_HASH",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.editDCVMethod");
    expect(calls[0]?.body.get("CertificateID")).toBe("123456");
    expect(calls[0]?.body.get("DCVMethod")).toBe("HTTP_CSR_HASH");
    expect(calls[0]?.body.has("DNSNames")).toBe(false);
    expect(result).toEqual({
      id: 123456,
      isSuccess: true,
      httpDCValidation: {
        valueAvailable: true,
        fileName: "ABCDEF.txt",
        fileContent: "hash-content",
      },
    });
  });

  it("editDCVMethod sends per-domain lists", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "editDCVMethod"));
    await client.ssl.editDCVMethod({
      certificateID: 123456,
      dnsNames: "a.example.com,b.example.com",
      dcvMethods: "HTTP_CSR_HASH,CNAME_CSR_HASH",
    });
    expect(calls[0]?.body.get("DNSNames")).toBe("a.example.com,b.example.com");
    expect(calls[0]?.body.get("DCVMethods")).toBe("HTTP_CSR_HASH,CNAME_CSR_HASH");
    expect(calls[0]?.body.has("DCVMethod")).toBe(false);
  });

  it("getInfo sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "getInfo"));
    const result = await client.ssl.getInfo({
      certificateID: 123456,
      returnCertificate: "true",
      returnType: "PKCS7",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.getInfo");
    expect(calls[0]?.body.get("CertificateID")).toBe("123456");
    expect(calls[0]?.body.get("Returncertificate")).toBe("true");
    expect(calls[0]?.body.get("Returntype")).toBe("PKCS7");
    expect(result).toEqual({
      certificateID: 123456,
      status: "Active",
      type: "PositiveSSL",
      commonName: "example.com",
      provider: "Comodo",
      issuedOn: "09/22/2020",
      expires: "09/22/2099",
    });
  });

  it("getInfo leaves the fixture-only attributes out when the response omits them", async () => {
    const xml = `<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
<Errors /><CommandResponse Type="namecheap.ssl.getInfo"><SSLGetInfoResult CertificateID="7" Status="Newpurchase" /></CommandResponse></ApiResponse>`;
    const { client } = createTestClient(xml);
    expect(await client.ssl.getInfo({ certificateID: 7 })).toEqual({
      certificateID: 7,
      status: "Newpurchase",
    });
  });

  it("renew sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "renew"));
    const result = await client.ssl.renew({
      certificateID: 123456,
      years: 1,
      sslType: "PositiveSSL",
      promotionCode: "PROMO",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.renew");
    expect(calls[0]?.body.get("CertificateID")).toBe("123456");
    expect(calls[0]?.body.get("Years")).toBe("1");
    expect(calls[0]?.body.get("SSLType")).toBe("PositiveSSL");
    expect(calls[0]?.body.get("PromotionCode")).toBe("PROMO");
    expect(result).toEqual({
      certificateID: 123456,
      years: 1,
      orderID: 11223344,
      transactionID: 55667788,
      chargedAmount: 7.5,
    });
  });

  it("purchaseMoreSans sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "purchaseMoreSans"));
    const result = await client.ssl.purchaseMoreSans({
      certificateID: 123456,
      numberOfSansToAdd: 5,
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.purchasemoresans");
    expect(calls[0]?.body.get("CertificateID")).toBe("123456");
    expect(calls[0]?.body.get("NumberOfSANSToAdd")).toBe("5");
    expect(result).toEqual({
      isSuccess: true,
      orderID: 11223344,
      transactionID: 55667788,
      chargedAmount: 15,
      certificateID: 123456,
      sslType: "PositiveSSL Multi-Domain",
      sansCount: 5,
    });
  });

  describe("billed commands parse tolerantly", () => {
    const wrap = (inner: string): string =>
      `<?xml version="1.0"?><ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response"><Errors /><CommandResponse Type="x">${inner}</CommandResponse></ApiResponse>`;

    it("create accepts a different wrapper element name", async () => {
      const xml = wrap(
        '<SomethingElse IsSuccess="true" OrderID="1" TransactionID="2" ChargedAmount="3.5" CertificateID="4" Created="c" SSLType="t" />',
      );
      const result = await createTestClient(xml).client.ssl.create({ years: 1, type: "t" });
      expect(result).toEqual({
        isSuccess: true,
        orderID: 1,
        transactionID: 2,
        chargedAmount: 3.5,
        certificateID: 4,
        created: "c",
        sslType: "t",
      });
    });

    it("create reads certificate fields from a nested SSLCertificate child", async () => {
      const xml = wrap(
        '<SSLCreateResult IsSuccess="true" OrderId="1" TransactionId="2"><SSLCertificate CertificateID="9" Created="c" SSLType="t" Status="Purchased" /></SSLCreateResult>',
      );
      const result = await createTestClient(xml).client.ssl.create({ years: 1, type: "t" });
      expect(result).toEqual({
        isSuccess: true,
        orderID: 1,
        transactionID: 2,
        certificateID: 9,
        created: "c",
        sslType: "t",
        status: "Purchased",
      });
    });

    it("renew accepts OrderId/TransactionId spellings", async () => {
      const xml = wrap('<SSLRenewResult CertificateID="1" OrderId="5" TransactionId="6" />');
      const result = await createTestClient(xml).client.ssl.renew({
        certificateID: 1,
        years: 1,
        sslType: "t",
      });
      expect(result).toEqual({ certificateID: 1, orderID: 5, transactionID: 6 });
    });

    it("purchaseMoreSans accepts OrderId/TransactionId spellings and another wrapper", async () => {
      const xml = wrap('<Other OrderId="5" TransactionId="6" SANSCount="2" />');
      const result = await createTestClient(xml).client.ssl.purchaseMoreSans({
        certificateID: 1,
        numberOfSansToAdd: 2,
      });
      expect(result).toEqual({ orderID: 5, transactionID: 6, sansCount: 2 });
    });

    it("does not throw on a malformed charged amount or flag", async () => {
      const xml = wrap(
        '<SSLCreateResult IsSuccess="maybe" OrderID="1" ChargedAmount="n/a" CertificateID="x" />',
      );
      const result = await createTestClient(xml).client.ssl.create({ years: 1, type: "t" });
      expect(result).toEqual({ orderID: 1 });
      const renewed = await createTestClient(
        wrap('<SSLRenewResult Years="1e3" ChargedAmount="n/a" />'),
      ).client.ssl.renew({ certificateID: 1, years: 1, sslType: "t" });
      expect(renewed).toEqual({});
    });

    it("returns an empty result for an empty CommandResponse", async () => {
      const xml = wrap("");
      const { client } = createTestClient(xml);
      expect(await client.ssl.create({ years: 1, type: "t" })).toEqual({});
      expect(await client.ssl.renew({ certificateID: 1, years: 1, sslType: "t" })).toEqual({});
      expect(await client.ssl.purchaseMoreSans({ certificateID: 1, numberOfSansToAdd: 1 })).toEqual(
        {},
      );
    });
  });

  it("revokeCertificate sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ssl", "revokeCertificate"));
    const result = await client.ssl.revokeCertificate({
      certificateID: 123456,
      certificateType: "PositiveSSL",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.ssl.revokecertificate");
    expect(calls[0]?.body.get("CertificateID")).toBe("123456");
    expect(calls[0]?.body.get("CertificateType")).toBe("PositiveSSL");
    expect(result).toEqual({ isSuccess: true, certificateID: 123456 });
  });

  it("rejects with NamecheapError carrying the code and message of an error response", async () => {
    const { client } = createTestClient(loadFixture("ssl", "error"));
    const error = await client.ssl.getInfo({ certificateID: 1 }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NamecheapError);
    expect((error as NamecheapError).code).toBe(2011294);
    expect((error as NamecheapError).message).toBe("Invalid certificate ID");
  });

  it("keeps every command key consistent with its Namecheap command name", () => {
    expect(Object.keys(sslCommands)).toHaveLength(13);
    for (const [key, command] of Object.entries(sslCommands)) {
      expect(command.name.split(".").at(-1)?.toLowerCase()).toBe(key.toLowerCase());
    }
  });
});

describe("ssl.getApproverEmailList with groups absent", () => {
  it("returns an empty list for each email group the response does not carry", async () => {
    const { client } = createTestClient(
      okEnvelope(
        `<GetApproverEmailListResult>
           <Domainemails><email>admin@example.com</email></Domainemails>
         </GetApproverEmailListResult>`,
        "namecheap.ssl.getApproverEmailList",
      ),
    );
    await expect(
      client.ssl.getApproverEmailList({
        domainName: "example.com",
        certificateType: "PositiveSSL",
      }),
    ).resolves.toEqual({
      domainEmails: ["admin@example.com"],
      genericEmails: [],
      manualEmails: [],
    });
  });
});
