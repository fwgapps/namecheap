import { defineCommand } from "../core/define";
import type { El } from "../core/element";
import { parsePaging } from "../core/paging";
import type { Paging } from "../core/paging";

// ---------------------------------------------------------------------------
// namecheap.domains.transfer.create
// ---------------------------------------------------------------------------

/**
 * @remarks Billed: this command charges your Namecheap account.
 */
export interface TransferCreateParams {
  /** Domain name to transfer. */
  domainName: string;
  /** Should be set to 1 year only. */
  years: number;
  /** EPP (authorization) code, required for most TLDs. */
  eppCode: string;
  promotionCode?: string;
  /** Add free domain privacy, `Yes` or `No`. Default: Yes. */
  addFreeWhoisguard?: string;
  /** Enable domain privacy, `Yes` or `No`. Default: No. Sent as `WGenable`. */
  wgEnable?: string;
}

export interface TransferCreateResult {
  domainName: string;
  transferID: number;
  statusID: number;
  orderID: number;
  transactionID: number;
  chargedAmount: number;
}

const create = /* @__PURE__ */ defineCommand<TransferCreateParams, TransferCreateResult>({
  name: "namecheap.domains.transfer.create",
  keys: { wgEnable: "WGenable" },
  parse: (cr) => {
    const result = cr.one("DomainTransferCreateResult");
    return {
      domainName: result.string("DomainName"),
      transferID: result.number("TransferID"),
      statusID: result.number("StatusID"),
      orderID: result.number("OrderID"),
      transactionID: result.number("TransactionID"),
      chargedAmount: result.number("ChargedAmount"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.transfer.getStatus
// ---------------------------------------------------------------------------

export interface TransferGetStatusParams {
  transferID: number;
}

export interface TransferGetStatusResult {
  transferID: number;
  statusID: number;
  status: string;
}

const getStatus = /* @__PURE__ */ defineCommand<TransferGetStatusParams, TransferGetStatusResult>({
  name: "namecheap.domains.transfer.getStatus",
  parse: (cr) => {
    const result = cr.one("DomainTransferGetStatusResult");
    return {
      transferID: result.number("TransferID"),
      statusID: result.number("StatusID"),
      status: result.string("Status"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.transfer.updateStatus
// ---------------------------------------------------------------------------

export interface TransferUpdateStatusParams {
  transferID: number;
  /** `true` resubmits the transfer. */
  resubmit: boolean;
}

export interface TransferUpdateStatusResult {
  transferID: number;
  resubmit: boolean;
}

const updateStatus = /* @__PURE__ */ defineCommand<
  TransferUpdateStatusParams,
  TransferUpdateStatusResult
>({
  name: "namecheap.domains.transfer.updateStatus",
  parse: (cr) => {
    const result = cr.one("DomainTransferUpdateStatusResult");
    return {
      transferID: result.number("TransferID"),
      resubmit: result.boolean("Resubmit"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.transfer.getList
// ---------------------------------------------------------------------------

export type TransferListType = "ALL" | "INPROGRESS" | "CANCELLED" | "COMPLETED";

export type TransferSortBy =
  | "DOMAINNAME"
  | "DOMAINNAME_DESC"
  | "TRANSFERDATE"
  | "TRANSFERDATE_DESC"
  | "STATUSDATE"
  | "STATUSDATE_DESC";

export interface TransferGetListParams {
  /** Default: ALL. */
  listType?: TransferListType;
  /** Keyword (domain name) to search. */
  searchTerm?: string;
  page?: number;
  /** Min 10, max 100. */
  pageSize?: number;
  sortBy?: TransferSortBy;
}

export interface TransferListItem {
  transferID: number;
  /** The reference spells this column `Domainname`; the fixture uses `DomainName`. */
  domainName: string;
  user: string;
  transferDate: string;
  orderID: number;
  statusID: number;
  status: string;
}

export interface TransferGetListResult {
  transfers: TransferListItem[];
  paging: Paging;
}

function parseListItem(transfer: El): TransferListItem {
  return {
    transferID: transfer.number("TransferID"),
    domainName: transfer.string("DomainName"),
    user: transfer.string("User"),
    transferDate: transfer.string("TransferDate"),
    orderID: transfer.number("OrderID"),
    statusID: transfer.number("StatusID"),
    status: transfer.string("Status"),
  };
}

const getList = /* @__PURE__ */ defineCommand<TransferGetListParams, TransferGetListResult>({
  name: "namecheap.domains.transfer.getList",
  parse: (cr) => ({
    transfers: (cr.optional("TransferGetListResult")?.all("Transfer") ?? []).map(parseListItem),
    paging: parsePaging(cr.one("Paging")),
  }),
});

/**
 * The command table behind `client.transfer`. Advanced use only: it is exported for custom
 * integrations and is not covered by semver stability.
 */
export const transferCommands = { create, getStatus, updateStatus, getList };

/**
 * Every command of this group as a standalone export (`<group><Method>`), for
 * tree-shaken use with `run(command, send, params)`; see the README.
 */
export {
  create as transferCreate,
  getStatus as transferGetStatus,
  updateStatus as transferUpdateStatus,
  getList as transferGetList,
};
