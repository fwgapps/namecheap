import { defineCommand } from "../core/define";
import type { El } from "../core/element";
import { optionalField } from "../core/fields";

// `AddressId` is sent with a lowercase `d` (the reference spelling), while the `ID`
// acronym would produce `AddressID`; every command that takes it carries a keys map.

// ---------------------------------------------------------------------------
// namecheap.users.address.create
// ---------------------------------------------------------------------------

export interface UsersAddressCreateParams {
  /** Address name/label (max 20 characters). */
  addressName: string;
  /** 1 to set as the default address, 0 otherwise. */
  defaultYN?: number;
  emailAddress: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  organization?: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  stateProvinceChoice: string;
  zip: string;
  /** Two-letter country code. */
  country: string;
  /** Format +NNN.NNNNNNNNNN. */
  phone: string;
  phoneExt?: string;
  /** Format +NNN.NNNNNNNNNN. */
  fax?: string;
}

export interface UsersAddressCreateResult {
  success: boolean;
  addressId: number;
  addressName: string;
}

const create = defineCommand<UsersAddressCreateParams, UsersAddressCreateResult>({
  name: "namecheap.users.address.create",
  parse: (cr) => {
    const result = cr.one("AddressCreateResult");
    return {
      success: result.boolean("Success"),
      addressId: result.number("AddressId"),
      addressName: result.string("AddressName"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.users.address.delete
// ---------------------------------------------------------------------------

export interface UsersAddressDeleteParams {
  /** Sent as `AddressId`. */
  addressId: number;
}

export interface UsersAddressDeleteResult {
  success: boolean;
  /** Id of the deleted address profile (`ProfileId`). */
  profileId: number;
  /** Listed in the official docs; absent from the captured response. */
  username?: string;
}

const deleteAddress = defineCommand<UsersAddressDeleteParams, UsersAddressDeleteResult>({
  name: "namecheap.users.address.delete",
  keys: { addressId: "AddressId" },
  parse: (cr) => {
    const result = cr.one("AddressDeleteResult");
    return {
      success: result.boolean("Success"),
      profileId: result.number("ProfileId"),
      ...optionalField("username", result.optionalString("Username")),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.users.address.getInfo
// ---------------------------------------------------------------------------

export interface UsersAddressGetInfoParams {
  /** Sent as `AddressId`; 0 is the primary address. */
  addressId: number;
}

/** Fields the reference says are omitted (not sent empty) when they have no value are optional. */
export interface UsersAddressGetInfoResult {
  addressId: number;
  userName: string;
  addressName: string;
  /** From the `Default_YN` element. */
  defaultYN: boolean;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  /** Not listed as omitted in the reference, but optional on the API side. */
  organization?: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  stateProvinceChoice: string;
  zip: string;
  country: string;
  phone: string;
  phoneExt?: string;
  fax?: string;
  emailAddress: string;
}

/** Text of an optional child element. */
const childText = (el: El, name: string): string | undefined => el.optional(name)?.text();

const getInfo = defineCommand<UsersAddressGetInfoParams, UsersAddressGetInfoResult>({
  name: "namecheap.users.address.getInfo",
  keys: { addressId: "AddressId" },
  parse: (cr) => {
    const result = cr.one("GetAddressInfoResult");
    return {
      addressId: result.one("AddressId").numberText(),
      userName: result.one("UserName").text(),
      addressName: result.one("AddressName").text(),
      defaultYN: result.one("Default_YN").booleanText(),
      firstName: result.one("FirstName").text(),
      lastName: result.one("LastName").text(),
      ...optionalField("jobTitle", childText(result, "JobTitle")),
      ...optionalField("organization", childText(result, "Organization")),
      address1: result.one("Address1").text(),
      ...optionalField("address2", childText(result, "Address2")),
      city: result.one("City").text(),
      stateProvince: result.one("StateProvince").text(),
      stateProvinceChoice: result.one("StateProvinceChoice").text(),
      zip: result.one("Zip").text(),
      country: result.one("Country").text(),
      phone: result.one("Phone").text(),
      ...optionalField("phoneExt", childText(result, "PhoneExt")),
      ...optionalField("fax", childText(result, "Fax")),
      emailAddress: result.one("EmailAddress").text(),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.users.address.getList
// ---------------------------------------------------------------------------

export interface UsersAddressListItem {
  addressId: number;
  addressName: string;
  isDefault: boolean;
}

/** The response has no `Paging` element, so the result is a bare array (empty when there are no `List` elements). */
export type UsersAddressGetListResult = UsersAddressListItem[];

const getList = defineCommand<Record<string, never>, UsersAddressGetListResult>({
  name: "namecheap.users.address.getList",
  parse: (cr) =>
    (cr.optional("AddressGetListResult")?.all("List") ?? []).map((item) => ({
      addressId: item.number("AddressId"),
      addressName: item.string("AddressName"),
      isDefault: item.boolean("IsDefault"),
    })),
});

// ---------------------------------------------------------------------------
// namecheap.users.address.setDefault
// ---------------------------------------------------------------------------

export interface UsersAddressSetDefaultParams {
  /** Sent as `AddressId`; 0 makes the primary address the default again. */
  addressId: number;
}

export interface UsersAddressSetDefaultResult {
  success: boolean;
  addressId: number;
}

const setDefault = defineCommand<UsersAddressSetDefaultParams, UsersAddressSetDefaultResult>({
  name: "namecheap.users.address.setDefault",
  keys: { addressId: "AddressId" },
  parse: (cr) => {
    const result = cr.one("AddressSetDefaultResult");
    return { success: result.boolean("Success"), addressId: result.number("AddressId") };
  },
});

// ---------------------------------------------------------------------------
// namecheap.users.address.update
// ---------------------------------------------------------------------------

/** Same fields as `create`; omitting `defaultYN` leaves the default flag unchanged. */
export interface UsersAddressUpdateParams extends UsersAddressCreateParams {
  /** Sent as `AddressId`. */
  addressId: number;
}

export interface UsersAddressUpdateResult {
  success: boolean;
  addressId: number;
  addressName: string;
}

const update = defineCommand<UsersAddressUpdateParams, UsersAddressUpdateResult>({
  name: "namecheap.users.address.update",
  keys: { addressId: "AddressId" },
  parse: (cr) => {
    const result = cr.one("AddressUpdateResult");
    return {
      success: result.boolean("Success"),
      addressId: result.number("AddressId"),
      addressName: result.string("AddressName"),
    };
  },
});

export const usersAddressCommands = {
  create,
  delete: deleteAddress,
  getInfo,
  getList,
  setDefault,
  update,
};
