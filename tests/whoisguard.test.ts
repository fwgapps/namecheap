import { describe, expect, it } from "vitest";
import { NamecheapError } from "../src";
import { whoisGuardCommands } from "../src/commands/whoisguard";
import { createTestClient, loadFixture, okEnvelope } from "./helpers";

describe("whoisguard", () => {
  it("changeEmailAddress sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("whoisguard", "changeEmailAddress"));
    const result = await client.whoisGuard.changeEmailAddress({ whoisguardID: 53536 });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.whoisguard.changeemailaddress");
    expect(calls[0]?.body.get("WhoisguardID")).toBe("53536");
    expect(result).toEqual({
      id: 53536,
      isSuccess: true,
      wgEmail: "[email protected]",
      wgOldEmail: "[email protected]",
    });
  });

  it("enable sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("whoisguard", "enable"));
    const result = await client.whoisGuard.enable({
      whoisguardID: 53536,
      forwardedToEmail: "me@example.com",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.whoisguard.enable");
    expect(calls[0]?.body.get("WhoisguardID")).toBe("53536");
    expect(calls[0]?.body.get("ForwardedToEmail")).toBe("me@example.com");
    expect(result).toEqual({ domainName: "example.com", isSuccess: true });
  });

  it("disable sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("whoisguard", "disable"));
    const result = await client.whoisGuard.disable({ whoisguardID: 53536 });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.whoisguard.disable");
    expect(calls[0]?.body.get("WhoisguardID")).toBe("53536");
    expect(result).toEqual({ domainName: "example.com", isSuccess: true });
  });

  it("getList sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("whoisguard", "getList"));
    const result = await client.whoisGuard.getList({ listType: "ALLOTED", page: 1, pageSize: 3 });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.whoisguard.getlist");
    expect(calls[0]?.body.get("ListType")).toBe("ALLOTED");
    expect(calls[0]?.body.get("Page")).toBe("1");
    expect(calls[0]?.body.get("PageSize")).toBe("3");
    expect(result).toEqual({
      whoisguards: [
        {
          id: 53536,
          domainName: "alpha.com",
          created: "10/22/2023",
          expires: "10/22/2024",
          status: "ENABLED",
        },
        {
          id: 53537,
          domainName: "beta.net",
          created: "11/01/2023",
          expires: "11/01/2024",
          status: "DISABLED",
        },
        { id: 53538, domainName: "", created: "12/01/2023", expires: "12/01/2024", status: "FREE" },
      ],
      paging: { totalItems: 5, currentPage: 1, pageSize: 3 },
    });
  });

  it("getList returns an array for a single subscription", async () => {
    const { client } = createTestClient(loadFixture("whoisguard", "getList-single"));
    const result = await client.whoisGuard.getList();
    expect(result).toEqual({
      whoisguards: [
        {
          id: 53536,
          domainName: "alpha.com",
          created: "10/22/2023",
          expires: "10/22/2024",
          status: "ENABLED",
        },
      ],
      paging: { totalItems: 1, currentPage: 1, pageSize: 10 },
    });
  });

  it("getList returns an empty array when there are no subscriptions", async () => {
    const { client } = createTestClient(loadFixture("whoisguard", "getList-empty"));
    const result = await client.whoisGuard.getList();
    expect(result).toEqual({
      whoisguards: [],
      paging: { totalItems: 0, currentPage: 1, pageSize: 10 },
    });
  });

  it("renew sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("whoisguard", "renew"));
    const result = await client.whoisGuard.renew({
      whoisguardID: 53536,
      years: 1,
      promotionCode: "PROMO",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.whoisguard.renew");
    expect(calls[0]?.body.get("WhoisguardID")).toBe("53536");
    expect(calls[0]?.body.get("Years")).toBe("1");
    expect(calls[0]?.body.get("PromotionCode")).toBe("PROMO");
    expect(result).toEqual({
      whoisguardID: 53536,
      years: 1,
      renew: true,
      orderID: 3666910,
      transactionID: 26781219,
      chargedAmount: 2.9,
    });
  });

  it("renew parses tolerantly: any result element name, only the attributes present", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
	<Errors />
	<CommandResponse Type="namecheap.whoisguard.renew">
		<SomethingElseResult OrderId="77" ChargedAmount="2.5000" Renew="maybe" />
	</CommandResponse>
</ApiResponse>`;
    const { client } = createTestClient(xml);
    const result = await client.whoisGuard.renew({ whoisguardID: 1, years: 1 });
    expect(result).toEqual({ orderID: 77, chargedAmount: 2.5 });
  });

  it("renew also reads the OrderID/TransactionID/WhoisguardID spellings, first present wins", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
	<Errors />
	<CommandResponse Type="namecheap.whoisguard.renew">
		<R WhoisguardID="5" OrderID="7" OrderId="8" TransactionID="9" />
	</CommandResponse>
</ApiResponse>`;
    const { client } = createTestClient(xml);
    expect(await client.whoisGuard.renew({ whoisguardID: 5, years: 1 })).toEqual({
      whoisguardID: 5,
      orderID: 7,
      transactionID: 9,
    });
  });

  it("renew never throws on unacceptable attribute values and reads Renew case-insensitively", async () => {
    const bad = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
	<Errors />
	<CommandResponse Type="namecheap.whoisguard.renew">
		<R ChargedAmount="n/a" OrderId="abc" Years="1.0e0" Renew="maybe" TransactionId="9" />
	</CommandResponse>
</ApiResponse>`;
    const first = createTestClient(bad);
    expect(await first.client.whoisGuard.renew({ whoisguardID: 1, years: 1 })).toEqual({
      transactionID: 9,
    });
    const second = createTestClient(bad.replace('Renew="maybe"', 'Renew="True"'));
    expect(await second.client.whoisGuard.renew({ whoisguardID: 1, years: 1 })).toEqual({
      transactionID: 9,
      renew: true,
    });
  });

  it("renew returns an empty object for an empty CommandResponse", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
	<Errors />
	<CommandResponse Type="namecheap.whoisguard.renew" />
</ApiResponse>`;
    const { client } = createTestClient(xml);
    expect(await client.whoisGuard.renew({ whoisguardID: 1, years: 1 })).toEqual({});
  });

  it("rejects with NamecheapError carrying the code and message of an error response", async () => {
    const { client } = createTestClient(loadFixture("whoisguard", "error"));
    const error = await client.whoisGuard
      .enable({ whoisguardID: 1, forwardedToEmail: "me@example.com" })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NamecheapError);
    expect((error as NamecheapError).code).toBe(2011166);
    expect((error as NamecheapError).message).toBe("Invalid WhoisguardID");
  });

  it("keeps every command key consistent with its Namecheap command name", () => {
    for (const [key, command] of Object.entries(whoisGuardCommands)) {
      expect(command.name.split(".").at(-1)?.toLowerCase()).toBe(key.toLowerCase());
    }
  });
});

describe("whoisGuard.getList with the result element absent", () => {
  it("returns an empty list and still parses the paging", async () => {
    const { client } = createTestClient(
      okEnvelope(
        "<Paging><TotalItems>0</TotalItems><CurrentPage>1</CurrentPage><PageSize>10</PageSize></Paging>",
        "namecheap.whoisguard.getlist",
      ),
    );
    await expect(client.whoisGuard.getList()).resolves.toEqual({
      whoisguards: [],
      paging: { totalItems: 0, currentPage: 1, pageSize: 10 },
    });
  });
});
