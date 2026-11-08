import { defineCommand } from "../core/define";
import { optionalField } from "../core/fields";

// ---------------------------------------------------------------------------
// namecheap.domains.ns.create
// ---------------------------------------------------------------------------

export interface NsCreateParams {
  /** SLD of the domain name. */
  sld: string;
  /** TLD of the domain name. */
  tld: string;
  /** Nameserver to create. */
  nameserver: string;
  /** Nameserver IP address. */
  ip: string;
}

export interface NsCreateResult {
  domain: string;
  nameserver: string;
  ip: string;
  isSuccess: boolean;
}

const create = /* @__PURE__ */ defineCommand<NsCreateParams, NsCreateResult>({
  name: "namecheap.domains.ns.create",
  parse: (cr) => {
    const result = cr.one("DomainNSCreateResult");
    return {
      domain: result.string("Domain"),
      nameserver: result.string("Nameserver"),
      ip: result.string("IP"),
      isSuccess: result.boolean("IsSuccess"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.ns.delete
// ---------------------------------------------------------------------------

export interface NsDeleteParams {
  sld: string;
  tld: string;
  /** Nameserver to delete. */
  nameserver: string;
}

export interface NsDeleteResult {
  domain: string;
  nameserver: string;
  isSuccess: boolean;
}

// No `validate`: this removes exactly the one named nameserver (targeted delete,
// not replace-all), and all three params are required by the type.
const deleteNs = /* @__PURE__ */ defineCommand<NsDeleteParams, NsDeleteResult>({
  name: "namecheap.domains.ns.delete",
  parse: (cr) => {
    const result = cr.one("DomainNSDeleteResult");
    return {
      domain: result.string("Domain"),
      nameserver: result.string("Nameserver"),
      isSuccess: result.boolean("IsSuccess"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.ns.getInfo
// ---------------------------------------------------------------------------

export interface NsGetInfoParams {
  sld: string;
  tld: string;
  /** Nameserver to get info for. */
  nameserver: string;
}

export interface NsGetInfoResult {
  domain: string;
  nameserver: string;
  ip: string;
  /** Present in recorded responses, not in the reference. */
  nameserverStatuses?: string[];
}

const getInfo = /* @__PURE__ */ defineCommand<NsGetInfoParams, NsGetInfoResult>({
  name: "namecheap.domains.ns.getInfo",
  parse: (cr) => {
    const result = cr.one("DomainNSInfoResult");
    const statuses = result.optional("NameserverStatuses");
    return {
      domain: result.string("Domain"),
      nameserver: result.string("Nameserver"),
      ip: result.string("IP"),
      ...optionalField(
        "nameserverStatuses",
        statuses?.all("Status").map((status) => status.text()),
      ),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.ns.update
// ---------------------------------------------------------------------------

export interface NsUpdateParams {
  sld: string;
  tld: string;
  /** Nameserver to update. */
  nameserver: string;
  /** Existing IP address. */
  oldIP: string;
  /** New IP address. */
  ip: string;
}

export interface NsUpdateResult {
  domain: string;
  nameserver: string;
  isSuccess: boolean;
}

const update = /* @__PURE__ */ defineCommand<NsUpdateParams, NsUpdateResult>({
  name: "namecheap.domains.ns.update",
  parse: (cr) => {
    const result = cr.one("DomainNSUpdateResult");
    return {
      domain: result.string("Domain"),
      nameserver: result.string("Nameserver"),
      isSuccess: result.boolean("IsSuccess"),
    };
  },
});

/**
 * The command table behind `client.ns`. Advanced use only: it is exported for custom
 * integrations and is not covered by semver stability.
 */
export const nsCommands = { create, delete: deleteNs, getInfo, update };

/**
 * Every command of this group as a standalone export (`<group><Method>`), for
 * tree-shaken use with `run(command, send, params)`; see the README.
 */
export { create as nsCreate, deleteNs as nsDelete, getInfo as nsGetInfo, update as nsUpdate };
