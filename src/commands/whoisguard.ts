import { defineCommand } from "../core/define";
import type { El } from "../core/element";
import { parsePaging } from "../core/paging";
import type { Paging } from "../core/paging";

// The service was renamed WithheldforPrivacy, but the API commands keep the
// `whoisguard` spelling (all lowercase in the reference).

// ---------------------------------------------------------------------------
// namecheap.whoisguard.changeemailaddress
// ---------------------------------------------------------------------------

export interface WhoisguardChangeEmailAddressParams {
  /** Unique domain privacy ID to change. Sent as `WhoisguardID`. */
  whoisguardID: number;
}

export interface WhoisguardChangeEmailAddressResult {
  /** Unique integer representing the domain privacy subscription. */
  id: number;
  isSuccess: boolean;
  /** New domain privacy email address. */
  wgEmail: string;
  /** Old domain privacy email address. */
  wgOldEmail: string;
}

const changeEmailAddress = defineCommand<
  WhoisguardChangeEmailAddressParams,
  WhoisguardChangeEmailAddressResult
>({
  name: "namecheap.whoisguard.changeemailaddress",
  parse: (cr) => {
    const result = cr.one("WhoisguardChangeEmailAddressResult");
    return {
      id: result.number("ID"),
      isSuccess: result.boolean("IsSuccess"),
      wgEmail: result.string("WGEmail"),
      wgOldEmail: result.string("WGOldEmail"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.whoisguard.enable
// ---------------------------------------------------------------------------

export interface WhoisguardEnableParams {
  /** Unique domain privacy ID to enable. Sent as `WhoisguardID`. */
  whoisguardID: number;
  /** Email address to forward domain privacy emails to (max 70 characters). */
  forwardedToEmail: string;
}

export interface WhoisguardEnableResult {
  domainName: string;
  isSuccess: boolean;
}

const enable = defineCommand<WhoisguardEnableParams, WhoisguardEnableResult>({
  name: "namecheap.whoisguard.enable",
  parse: (cr) => {
    const result = cr.one("WhoisguardEnableResult");
    return {
      domainName: result.string("DomainName"),
      isSuccess: result.boolean("IsSuccess"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.whoisguard.disable
// ---------------------------------------------------------------------------

export interface WhoisguardDisableParams {
  /** Unique domain privacy ID to disable. Sent as `WhoisguardID`. */
  whoisguardID: number;
}

export interface WhoisguardDisableResult {
  /** The reference spells this `Domainname`; the fixture uses `DomainName`. */
  domainName: string;
  isSuccess: boolean;
}

const disable = defineCommand<WhoisguardDisableParams, WhoisguardDisableResult>({
  name: "namecheap.whoisguard.disable",
  parse: (cr) => {
    const result = cr.one("WhoisguardDisableResult");
    return {
      domainName: result.string("DomainName"),
      isSuccess: result.boolean("IsSuccess"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.whoisguard.getlist
// ---------------------------------------------------------------------------

/** `ALLOTED` is the API's own (nonstandard) spelling and is sent verbatim. */
export type WhoisguardListType = "ALL" | "ALLOTED" | "FREE" | "DISCARD";

export interface WhoisguardGetListParams {
  /** Default: ALL. */
  listType?: WhoisguardListType;
  /** Default: 1. */
  page?: number;
  /** Min 2, max 100. */
  pageSize?: number;
}

export interface WhoisguardListItem {
  /** Unique integer representing the subscription (the reference column is "Whoisguard ID"). */
  id: number;
  /** The reference spells this column `Domainname`; the fixture uses `DomainName`. Empty for a FREE subscription. */
  domainName: string;
  created: string;
  expires: string;
  status: string;
}

export interface WhoisguardGetListResult {
  whoisguards: WhoisguardListItem[];
  paging: Paging;
}

function parseListItem(item: El): WhoisguardListItem {
  return {
    id: item.number("ID"),
    domainName: item.string("DomainName"),
    created: item.string("Created"),
    expires: item.string("Expires"),
    status: item.string("Status"),
  };
}

const getList = defineCommand<WhoisguardGetListParams, WhoisguardGetListResult>({
  name: "namecheap.whoisguard.getlist",
  parse: (cr) => ({
    whoisguards: (cr.optional("WhoisguardGetListResult")?.all("Whoisguard") ?? []).map(
      parseListItem,
    ),
    paging: parsePaging(cr.one("Paging")),
  }),
});

// ---------------------------------------------------------------------------
// namecheap.whoisguard.renew
// ---------------------------------------------------------------------------

export interface WhoisguardRenewParams {
  /** Domain privacy ID to renew. Sent as `WhoisguardID`. */
  whoisguardID: number;
  /** Number of years to renew. Default: 1. */
  years: number;
  promotionCode?: string;
}

// The reference documents the response columns ("WhoisGuard ID", "OrderId",
// "TransactionId", ...) but no SDK fixture exists, so the element and attribute
// spelling follow Namecheap's documented sample (see tests/fixtures/whoisguard/renew.xml).
export interface WhoisguardRenewResult {
  whoisguardId: number;
  years: number;
  renew: boolean;
  orderId: number;
  transactionId: number;
  chargedAmount: number;
}

const renew = defineCommand<WhoisguardRenewParams, WhoisguardRenewResult>({
  name: "namecheap.whoisguard.renew",
  parse: (cr) => {
    const result = cr.one("WhoisguardRenewResult");
    return {
      whoisguardId: result.number("WhoisguardId"),
      years: result.number("Years"),
      renew: result.boolean("Renew"),
      orderId: result.number("OrderId"),
      transactionId: result.number("TransactionId"),
      chargedAmount: result.number("ChargedAmount"),
    };
  },
});

export const whoisGuardCommands = { changeEmailAddress, enable, disable, getList, renew };
