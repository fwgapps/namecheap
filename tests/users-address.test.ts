import { describe, expect, it } from "vitest";
import { NamecheapError } from "../src";
import { usersAddressCommands } from "../src/commands/users-address";
import { createTestClient, loadFixture } from "./helpers";

const addressParams = {
  addressName: "Home",
  defaultYN: 1,
  emailAddress: "user@example.com",
  firstName: "Test",
  lastName: "Probe",
  jobTitle: "Engineer",
  organization: "Example Org",
  address1: "1 Test Street",
  address2: "Suite 2",
  city: "Phoenix",
  stateProvince: "AZ",
  stateProvinceChoice: "S",
  zip: "85284",
  country: "US",
  phone: "+1.5555555555",
  phoneExt: "12",
  fax: "+1.5555555556",
};

const addressWire: Array<[string, string]> = [
  ["AddressName", "Home"],
  ["DefaultYN", "1"],
  ["EmailAddress", "user@example.com"],
  ["FirstName", "Test"],
  ["LastName", "Probe"],
  ["JobTitle", "Engineer"],
  ["Organization", "Example Org"],
  ["Address1", "1 Test Street"],
  ["Address2", "Suite 2"],
  ["City", "Phoenix"],
  ["StateProvince", "AZ"],
  ["StateProvinceChoice", "S"],
  ["Zip", "85284"],
  ["Country", "US"],
  ["Phone", "+1.5555555555"],
  ["PhoneExt", "12"],
  ["Fax", "+1.5555555556"],
];

describe("users-address", () => {
  it("create sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users-address", "create"));
    const result = await client.usersAddress.create(addressParams);
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.address.create");
    for (const [name, value] of addressWire) expect(calls[0]?.body.get(name)).toBe(value);
    expect(result).toEqual({ success: true, addressId: 149237, addressName: "sdk-212-probe" });
  });

  it("delete sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users-address", "delete"));
    const result = await client.usersAddress.delete({ addressId: 149237 });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.address.delete");
    expect(calls[0]?.body.get("AddressId")).toBe("149237");
    expect(calls[0]?.body.has("AddressID")).toBe(false);
    expect(result).toEqual({ success: true, profileId: 149237 });
  });

  it("getInfo sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users-address", "getInfo"));
    const result = await client.usersAddress.getInfo({ addressId: 0 });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.address.getInfo");
    expect(calls[0]?.body.get("AddressId")).toBe("0");
    expect(result).toEqual({
      addressId: 0,
      userName: "sandboxuser",
      addressName: "Main Address",
      defaultYN: true,
      firstName: "Test",
      lastName: "Probe",
      organization: "Example Org",
      address1: "1 Test Street",
      city: "Phoenix",
      stateProvince: "AZ",
      stateProvinceChoice: "S",
      zip: "85284",
      country: "US",
      phone: "+1.5555555555",
      emailAddress: "user@example.com",
    });
  });

  it("getList sends the documented request and returns a bare array", async () => {
    const { client, calls } = createTestClient(loadFixture("users-address", "getList"));
    const result = await client.usersAddress.getList();
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.address.getList");
    expect(result).toEqual([
      { addressId: 0, addressName: "Primary Address", isDefault: true },
      { addressId: 149248, addressName: "sdk-nondefault-fixture", isDefault: false },
    ]);
  });

  it("setDefault sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users-address", "setDefault"));
    const result = await client.usersAddress.setDefault({ addressId: 0 });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.address.setDefault");
    expect(calls[0]?.body.get("AddressId")).toBe("0");
    expect(result).toEqual({ success: true, addressId: 0 });
  });

  it("update sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users-address", "update"));
    const result = await client.usersAddress.update({ addressId: 149238, ...addressParams });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.address.update");
    expect(calls[0]?.body.get("AddressId")).toBe("149238");
    expect(calls[0]?.body.has("AddressID")).toBe(false);
    for (const [name, value] of addressWire) expect(calls[0]?.body.get(name)).toBe(value);
    expect(result).toEqual({ success: true, addressId: 149238, addressName: "sdk-212-probe2" });
  });

  it("getInfo omits optional fields the API leaves out and reads them when present", async () => {
    const full = loadFixture("users-address", "getInfo").replace(
      "<Organization>",
      "<JobTitle>Engineer</JobTitle><Address2>Suite 2</Address2><PhoneExt>12</PhoneExt><Fax>+1.5555555556</Fax><Organization>",
    );
    const { client } = createTestClient(full);
    const result = await client.usersAddress.getInfo({ addressId: 0 });
    expect(result).toMatchObject({
      jobTitle: "Engineer",
      address2: "Suite 2",
      phoneExt: "12",
      fax: "+1.5555555556",
    });
    const bare = createTestClient(loadFixture("users-address", "getInfo"));
    const bareResult = await bare.client.usersAddress.getInfo({ addressId: 0 });
    for (const key of ["jobTitle", "address2", "phoneExt", "fax"]) {
      expect(bareResult).not.toHaveProperty(key);
    }
  });

  it("delete reads the documented Username when present", async () => {
    const xml = loadFixture("users-address", "delete").replace(
      'ProfileId="149237"',
      'ProfileId="149237" Username="sandboxuser"',
    );
    const { client } = createTestClient(xml);
    expect(await client.usersAddress.delete({ addressId: 149237 })).toEqual({
      success: true,
      profileId: 149237,
      username: "sandboxuser",
    });
  });

  describe("getList", () => {
    const envelope = (inner: string): string =>
      `<?xml version="1.0"?><ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response"><Errors /><CommandResponse Type="namecheap.users.address.getList"><AddressGetListResult>${inner}</AddressGetListResult></CommandResponse></ApiResponse>`;

    it("returns a one-element array for a single address", async () => {
      const { client } = createTestClient(
        envelope('<List AddressId="0" AddressName="Primary Address" IsDefault="true" />'),
      );
      expect(await client.usersAddress.getList()).toEqual([
        { addressId: 0, addressName: "Primary Address", isDefault: true },
      ]);
    });

    it("returns an empty array when there are no addresses", async () => {
      const { client } = createTestClient(envelope(""));
      expect(await client.usersAddress.getList()).toEqual([]);
    });
  });

  it("update omits unset optional params from the request", async () => {
    const { client, calls } = createTestClient(loadFixture("users-address", "update"));
    await client.usersAddress.update({
      addressId: 1,
      addressName: "Home",
      emailAddress: "user@example.com",
      firstName: "Test",
      lastName: "Probe",
      address1: "1 Test Street",
      city: "Phoenix",
      stateProvince: "AZ",
      stateProvinceChoice: "S",
      zip: "85284",
      country: "US",
      phone: "+1.5555555555",
    });
    for (const name of ["DefaultYN", "JobTitle", "Organization", "Address2", "PhoneExt", "Fax"]) {
      expect(calls[0]?.body.has(name)).toBe(false);
    }
  });

  it("rejects with NamecheapError carrying the code and message of the error fixture", async () => {
    const { client } = createTestClient(loadFixture("users-address", "error"));
    const error = (await client.usersAddress
      .getInfo({ addressId: 1 })
      .catch((e: unknown) => e)) as NamecheapError;
    expect(error).toBeInstanceOf(NamecheapError);
    expect(error.code).toBe(4022336);
    expect(error.message).toContain("Failed to retrieve user's address");
  });

  it("keeps every command key consistent with its Namecheap command name", () => {
    expect(Object.keys(usersAddressCommands)).toHaveLength(6);
    for (const [key, command] of Object.entries(usersAddressCommands)) {
      expect(command.name.split(".").at(-1)?.toLowerCase()).toBe(key.toLowerCase());
    }
  });
});
