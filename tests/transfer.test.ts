import { describe, expect, it } from "vitest";
import { NamecheapError } from "../src";
import { transferCommands } from "../src/commands/transfer";
import { createTestClient, loadFixture } from "./helpers";

describe("transfer", () => {
  it("create sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("transfer", "create"));
    const result = await client.transfer.create({
      domainName: "example.com",
      years: 1,
      eppCode: "EPP-SECRET",
      promotionCode: "PROMO",
      addFreeWhoisguard: "Yes",
      wgEnable: "No",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.transfer.create");
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    expect(calls[0]?.body.get("Years")).toBe("1");
    expect(calls[0]?.body.get("EPPCode")).toBe("EPP-SECRET");
    expect(calls[0]?.body.get("PromotionCode")).toBe("PROMO");
    expect(calls[0]?.body.get("AddFreeWhoisguard")).toBe("Yes");
    expect(calls[0]?.body.get("WGenable")).toBe("No");
    expect(result).toEqual({
      domainName: "example.com",
      transferID: 123456,
      statusID: 11,
      orderID: 987654,
      transactionID: 112233,
      chargedAmount: 10.87,
    });
  });

  it("getStatus sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("transfer", "getStatus"));
    const result = await client.transfer.getStatus({ transferID: 123456 });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.transfer.getStatus");
    expect(calls[0]?.body.get("TransferID")).toBe("123456");
    expect(result).toEqual({
      transferID: 123456,
      statusID: 5,
      status: "Transfer in progress, awaiting EPP code",
    });
  });

  it("updateStatus sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("transfer", "updateStatus"));
    const result = await client.transfer.updateStatus({ transferID: 123456, resubmit: true });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.transfer.updateStatus");
    expect(calls[0]?.body.get("TransferID")).toBe("123456");
    expect(calls[0]?.body.get("Resubmit")).toBe("true");
    expect(result).toEqual({ transferID: 123456, resubmit: true });
  });

  it("getList sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("transfer", "getList"));
    const result = await client.transfer.getList({
      listType: "INPROGRESS",
      searchTerm: "alpha",
      page: 1,
      pageSize: 10,
      sortBy: "TRANSFERDATE_DESC",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.transfer.getList");
    expect(calls[0]?.body.get("ListType")).toBe("INPROGRESS");
    expect(calls[0]?.body.get("SearchTerm")).toBe("alpha");
    expect(calls[0]?.body.get("Page")).toBe("1");
    expect(calls[0]?.body.get("PageSize")).toBe("10");
    expect(calls[0]?.body.get("SortBy")).toBe("TRANSFERDATE_DESC");
    expect(result).toEqual({
      transfers: [
        {
          transferID: 101,
          domainName: "alpha.com",
          user: "acct",
          transferDate: "05/20/2026",
          orderID: 9001,
          statusID: 5,
          status: "Transfer in progress",
        },
        {
          transferID: 102,
          domainName: "beta.net",
          user: "acct",
          transferDate: "05/21/2026",
          orderID: 9002,
          statusID: 20,
          status: "Transfer completed",
        },
      ],
      paging: { totalItems: 2, currentPage: 1, pageSize: 10 },
    });
  });

  it("getList returns an array for a single transfer", async () => {
    const { client } = createTestClient(loadFixture("transfer", "getList-single"));
    const result = await client.transfer.getList();
    expect(result).toEqual({
      transfers: [
        {
          transferID: 101,
          domainName: "alpha.com",
          user: "acct",
          transferDate: "05/20/2026",
          orderID: 9001,
          statusID: 5,
          status: "Transfer in progress",
        },
      ],
      paging: { totalItems: 1, currentPage: 1, pageSize: 10 },
    });
  });

  it("getList returns an empty array when there are no transfers", async () => {
    const { client } = createTestClient(loadFixture("transfer", "getList-empty"));
    const result = await client.transfer.getList();
    expect(result).toEqual({
      transfers: [],
      paging: { totalItems: 0, currentPage: 1, pageSize: 10 },
    });
  });

  it("rejects with NamecheapError carrying the code and message of an error response", async () => {
    const { client } = createTestClient(loadFixture("transfer", "error"));
    const error = await client.transfer
      .create({ domainName: "example.com", years: 1, eppCode: "bad" })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NamecheapError);
    expect((error as NamecheapError).code).toBe(2030280);
    expect((error as NamecheapError).message).toBe("Invalid EPP code");
  });

  it("keeps every command key consistent with its Namecheap command name", () => {
    for (const [key, command] of Object.entries(transferCommands)) {
      expect(command.name.split(".").at(-1)?.toLowerCase()).toBe(key.toLowerCase());
    }
  });
});
