import { defineCommand } from "../core/define";
import type { El } from "../core/element";
import { firstLenientNumber, optionalField } from "../core/fields";
import { parsePaging } from "../core/paging";
import type { Paging } from "../core/paging";

// ---------------------------------------------------------------------------
// namecheap.ssl.create
// ---------------------------------------------------------------------------

/**
 * @remarks Billed: this command charges your Namecheap account.
 */
export interface SslCreateParams {
  /** Number of years for the certificate. Allowed values: 1 to 5. */
  years: number;
  /** SSL product name. */
  type: string;
  /** Number of add-on domains for multi-domain certificates. Sent as `SANStoADD`. */
  sansToAdd?: number;
  promotionCode?: string;
}

/** Every field is optional: the response shape of this billed command is not documented. */
export interface SslCreateResult {
  isSuccess?: boolean;
  orderID?: number;
  transactionID?: number;
  chargedAmount?: number;
  certificateID?: number;
  created?: string;
  sslType?: string;
  status?: string;
}

const create = defineCommand<SslCreateParams, SslCreateResult>({
  name: "namecheap.ssl.create",
  keys: { sansToAdd: "SANStoADD" },
  parse: (cr) => {
    const wrapper = cr.optional("SSLCreateResult") ?? cr.children()[0];
    if (wrapper === undefined) return {};
    const nested = wrapper.optional("SSLCertificate");
    const sources = nested === undefined ? [wrapper] : [wrapper, nested];
    const pick = <T>(read: (el: El) => T | undefined): T | undefined =>
      sources.map(read).find((value) => value !== undefined);
    return {
      ...optionalField("isSuccess", wrapper.lenientBoolean("IsSuccess")),
      ...optionalField("orderID", firstLenientNumber(wrapper, "OrderID", "OrderId")),
      ...optionalField(
        "transactionID",
        firstLenientNumber(wrapper, "TransactionID", "TransactionId"),
      ),
      ...optionalField("chargedAmount", wrapper.lenientNumber("ChargedAmount")),
      ...optionalField(
        "certificateID",
        pick((el) => el.lenientNumber("CertificateID")),
      ),
      ...optionalField(
        "created",
        pick((el) => el.optionalString("Created")),
      ),
      ...optionalField(
        "sslType",
        pick((el) => el.optionalString("SSLType")),
      ),
      ...optionalField(
        "status",
        pick((el) => el.optionalString("Status")),
      ),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.ssl.getList
// ---------------------------------------------------------------------------

export type SslListType =
  | "ALL"
  | "Processing"
  | "EmailSent"
  | "TechnicalProblem"
  | "InProgress"
  | "Completed"
  | "Deactivated"
  | "Active"
  | "Cancelled"
  | "NewPurchase"
  | "NewRenewal";

export type SslSortBy =
  | "PURCHASEDATE"
  | "PURCHASEDATE_DESC"
  | "SSLTYPE"
  | "SSLTYPE_DESC"
  | "EXPIREDATETIME"
  | "EXPIREDATETIME_DESC"
  | "Host_Name"
  | "Host_Name_DESC";

export interface SslGetListParams {
  /** Default: ALL. */
  listType?: SslListType;
  /** Keyword to look for. */
  searchTerm?: string;
  page?: number;
  /** Min 10, max 100. Default: 20. */
  pageSize?: number;
  sortBy?: SslSortBy;
}

export interface SslListItem {
  certificateID: number;
  hostName: string;
  sslType: string;
  purchaseDate: string;
  expireDate: string;
  /** Present in the fixtures but not in the reference table. */
  status?: string;
}

export interface SslGetListResult {
  certificates: SslListItem[];
  paging: Paging;
}

function parseListItem(ssl: El): SslListItem {
  return {
    certificateID: ssl.number("CertificateID"),
    hostName: ssl.string("HostName"),
    sslType: ssl.string("SSLType"),
    purchaseDate: ssl.string("PurchaseDate"),
    expireDate: ssl.string("ExpireDate"),
    ...optionalField("status", ssl.optionalString("Status")),
  };
}

const getList = defineCommand<SslGetListParams, SslGetListResult>({
  name: "namecheap.ssl.getList",
  parse: (cr) => ({
    certificates: (cr.optional("SSLListResult")?.all("SSL") ?? []).map(parseListItem),
    paging: parsePaging(cr.one("Paging")),
  }),
});

// ---------------------------------------------------------------------------
// namecheap.ssl.parseCSR
// ---------------------------------------------------------------------------

export interface SslParseCsrParams {
  /** Certificate Signing Request (PEM text). Sent as the lowercase `csr`. */
  csr: string;
  certificateType?: string;
}

export interface SslParseCsrResult {
  commonName: string;
  domainName: string;
  country: string;
  organisationUnit: string;
  organisation: string;
  state: string;
  locality: string;
  email: string;
}

const parseCSR = defineCommand<SslParseCsrParams, SslParseCsrResult>({
  name: "namecheap.ssl.parseCSR",
  keys: { csr: "csr" },
  parse: (cr) => {
    const details = cr.one("SSLParseCSRResult").one("CSRDetails");
    return {
      commonName: details.one("CommonName").text(),
      domainName: details.one("DomainName").text(),
      country: details.one("Country").text(),
      organisationUnit: details.one("OrganisationUnit").text(),
      organisation: details.one("Organisation").text(),
      state: details.one("State").text(),
      locality: details.one("Locality").text(),
      email: details.one("Email").text(),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.ssl.getApproverEmailList
// ---------------------------------------------------------------------------

export interface SslGetApproverEmailListParams {
  domainName: string;
  certificateType: string;
}

export interface SslGetApproverEmailListResult {
  /** Domain WHOIS email addresses (`Domainemails`). */
  domainEmails: string[];
  /** Generic email addresses for the domain (`Genericemails`). */
  genericEmails: string[];
  /** Additional emails from the provider (`Manualemails`). */
  manualEmails: string[];
}

function emails(result: El, group: string): string[] {
  return (result.optional(group)?.all("email") ?? []).map((email) => email.text());
}

const getApproverEmailList = defineCommand<
  SslGetApproverEmailListParams,
  SslGetApproverEmailListResult
>({
  name: "namecheap.ssl.getApproverEmailList",
  parse: (cr) => {
    const result = cr.one("GetApproverEmailListResult");
    return {
      domainEmails: emails(result, "Domainemails"),
      genericEmails: emails(result, "Genericemails"),
      manualEmails: emails(result, "Manualemails"),
    };
  },
});

// ---------------------------------------------------------------------------
// Shared: HTTP DCV block and the { id, isSuccess } result
// ---------------------------------------------------------------------------

export interface SslHttpDcValidation {
  /** True when HTTP_CSR_HASH was set for at least one domain. */
  valueAvailable: boolean;
  fileName?: string;
  fileContent?: string;
}

function parseHttpDcValidation(result: El): SslHttpDcValidation | undefined {
  const validation = result.optional("HttpDCValidation");
  if (validation === undefined) return undefined;
  return {
    valueAvailable: validation.boolean("ValueAvailable"),
    ...optionalField("fileName", validation.optional("FileName")?.text()),
    ...optionalField("fileContent", validation.optional("FileContent")?.text()),
  };
}

// ---------------------------------------------------------------------------
// namecheap.ssl.activate
// ---------------------------------------------------------------------------

export interface SslActivateParams {
  certificateID: number;
  /** Certificate Signing Request (PEM text, may span several lines). */
  csr: string;
  /** Email to send the signed certificate file to. */
  adminEmailAddress: string;
  /** Server software type, e.g. `apacheopenssl`, `nginx`, `iis`. */
  webServerType?: string;
  uniqueValue?: string;
}

export interface SslActivateResult {
  id: number;
  isSuccess: boolean;
  /** Present when the response carries an HTTP DCV block. */
  httpDCValidation?: SslHttpDcValidation;
}

function parseActivation(result: El): SslActivateResult {
  return {
    id: result.number("ID"),
    isSuccess: result.boolean("IsSuccess"),
    ...optionalField("httpDCValidation", parseHttpDcValidation(result)),
  };
}

const activate = defineCommand<SslActivateParams, SslActivateResult>({
  name: "namecheap.ssl.activate",
  parse: (cr) => parseActivation(cr.one("SSLActivateResult")),
});

// ---------------------------------------------------------------------------
// namecheap.ssl.resendApproverEmail
// ---------------------------------------------------------------------------

export interface SslResendApproverEmailParams {
  certificateID: number;
}

export interface SslResendApproverEmailResult {
  id: number;
  isSuccess: boolean;
}

const resendApproverEmail = defineCommand<
  SslResendApproverEmailParams,
  SslResendApproverEmailResult
>({
  name: "namecheap.ssl.resendApproverEmail",
  parse: (cr) => {
    const result = cr.one("SSLResendApproverEmailResult");
    return { id: result.number("ID"), isSuccess: result.boolean("IsSuccess") };
  },
});

// ---------------------------------------------------------------------------
// namecheap.ssl.reissue
// ---------------------------------------------------------------------------

export interface SslReissueParams {
  certificateID: number;
  /** Certificate Signing Request (PEM text, may span several lines). */
  csr: string;
  /** Cannot be changed from the initial activation. */
  adminEmailAddress?: string;
  webServerType?: string;
  uniqueValue?: string;
}

export type SslReissueResult = SslActivateResult;

const reissue = defineCommand<SslReissueParams, SslReissueResult>({
  name: "namecheap.ssl.reissue",
  parse: (cr) => parseActivation(cr.one("SSLReissueResult")),
});

// ---------------------------------------------------------------------------
// namecheap.ssl.resendfulfillmentemail
// ---------------------------------------------------------------------------

export interface SslResendFulfillmentEmailParams {
  certificateID: number;
}

export interface SslResendFulfillmentEmailResult {
  id: number;
  isSuccess: boolean;
}

const resendFulfillmentEmail = defineCommand<
  SslResendFulfillmentEmailParams,
  SslResendFulfillmentEmailResult
>({
  name: "namecheap.ssl.resendfulfillmentemail",
  parse: (cr) => {
    const result = cr.one("SSLResendFulfillmentEmailResult");
    return { id: result.number("ID"), isSuccess: result.boolean("IsSuccess") };
  },
});

// ---------------------------------------------------------------------------
// namecheap.ssl.editDCVMethod
// ---------------------------------------------------------------------------

/** Either one `dcvMethod` for the whole certificate, or `dnsNames` plus `dcvMethods` per domain. */
export type SslEditDcvMethodParams =
  | {
      certificateID: number;
      /** DCV method used to validate domain control. */
      dcvMethod: string;
    }
  | {
      certificateID: number;
      /** Comma-separated list of domain names. */
      dnsNames: string;
      /** Comma-separated list of DCV methods, one per domain name. */
      dcvMethods: string;
    };

export type SslEditDcvMethodResult = SslActivateResult;

const editDCVMethod = defineCommand<SslEditDcvMethodParams, SslEditDcvMethodResult>({
  name: "namecheap.ssl.editDCVMethod",
  parse: (cr) => parseActivation(cr.one("SSLEditDCVMethodResult")),
});

// ---------------------------------------------------------------------------
// namecheap.ssl.getInfo
// ---------------------------------------------------------------------------

export type SslReturnType = "Individual" | "PKCS7";

export interface SslGetInfoParams {
  certificateID: number;
  /**
   * Flag for returning the certificate in the response. Sent as `Returncertificate`.
   *
   * @remarks The response shape for the certificate body is undocumented, so 1.0 does
   * not parse it: the result never contains the certificate.
   */
  returnCertificate?: string;
  /** Format of the returned certificate. Sent as `Returntype`. */
  returnType?: SslReturnType;
}

export interface SslGetInfoResult {
  certificateID: number;
  /** For example `Active`, `Newpurchase`, `Purchased`, `Cancelled`. */
  status: string;
  /** The attributes below are in the fixture but not in the reference. */
  type?: string;
  commonName?: string;
  provider?: string;
  issuedOn?: string;
  expires?: string;
}

const getInfo = defineCommand<SslGetInfoParams, SslGetInfoResult>({
  name: "namecheap.ssl.getInfo",
  keys: { returnCertificate: "Returncertificate", returnType: "Returntype" },
  parse: (cr) => {
    const result = cr.one("SSLGetInfoResult");
    return {
      certificateID: result.number("CertificateID"),
      status: result.string("Status"),
      ...optionalField("type", result.optionalString("Type")),
      ...optionalField("commonName", result.optionalString("CommonName")),
      ...optionalField("provider", result.optionalString("Provider")),
      ...optionalField("issuedOn", result.optionalString("IssuedOn")),
      ...optionalField("expires", result.optionalString("Expires")),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.ssl.renew
// ---------------------------------------------------------------------------

/**
 * @remarks Billed: this command charges your Namecheap account.
 */
export interface SslRenewParams {
  certificateID: number;
  /** Allowed values: 1 to 5. */
  years: number;
  /** SSL product name. */
  sslType: string;
  promotionCode?: string;
}

/** Every field is optional: the response shape of this billed command is not documented. */
export interface SslRenewResult {
  certificateID?: number;
  years?: number;
  orderID?: number;
  transactionID?: number;
  chargedAmount?: number;
}

const renew = defineCommand<SslRenewParams, SslRenewResult>({
  name: "namecheap.ssl.renew",
  parse: (cr) => {
    const result = cr.optional("SSLRenewResult") ?? cr.children()[0];
    if (result === undefined) return {};
    return {
      ...optionalField("certificateID", result.lenientNumber("CertificateID")),
      ...optionalField("years", result.lenientNumber("Years")),
      ...optionalField("orderID", firstLenientNumber(result, "OrderID", "OrderId")),
      ...optionalField(
        "transactionID",
        firstLenientNumber(result, "TransactionID", "TransactionId"),
      ),
      ...optionalField("chargedAmount", result.lenientNumber("ChargedAmount")),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.ssl.purchasemoresans
// ---------------------------------------------------------------------------

/**
 * @remarks Billed: this command charges your Namecheap account.
 */
export interface SslPurchaseMoreSansParams {
  certificateID: number;
  /** Number of add-on domains to order. Sent as `NumberOfSANSToAdd`. */
  numberOfSansToAdd: number;
}

/** Every field is optional: the response shape of this billed command is not documented. */
export interface SslPurchaseMoreSansResult {
  isSuccess?: boolean;
  orderID?: number;
  transactionID?: number;
  chargedAmount?: number;
  certificateID?: number;
  sslType?: string;
  /** Number of add-on domains (`SANSCount`). */
  sansCount?: number;
}

const purchaseMoreSans = defineCommand<SslPurchaseMoreSansParams, SslPurchaseMoreSansResult>({
  name: "namecheap.ssl.purchasemoresans",
  keys: { numberOfSansToAdd: "NumberOfSANSToAdd" },
  parse: (cr) => {
    const result = cr.optional("SSLPurchaseMoreSansResult") ?? cr.children()[0];
    if (result === undefined) return {};
    return {
      ...optionalField("isSuccess", result.lenientBoolean("IsSuccess")),
      ...optionalField("orderID", firstLenientNumber(result, "OrderID", "OrderId")),
      ...optionalField(
        "transactionID",
        firstLenientNumber(result, "TransactionID", "TransactionId"),
      ),
      ...optionalField("chargedAmount", result.lenientNumber("ChargedAmount")),
      ...optionalField("certificateID", result.lenientNumber("CertificateID")),
      ...optionalField("sslType", result.optionalString("SSLType")),
      ...optionalField("sansCount", result.lenientNumber("SANSCount")),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.ssl.revokecertificate
// ---------------------------------------------------------------------------

/**
 * @remarks Irreversible: a revoked certificate cannot be restored.
 */
export interface SslRevokeCertificateParams {
  certificateID: number;
  certificateType: string;
}

export interface SslRevokeCertificateResult {
  isSuccess: boolean;
  certificateID: number;
}

const revokeCertificate = defineCommand<SslRevokeCertificateParams, SslRevokeCertificateResult>({
  name: "namecheap.ssl.revokecertificate",
  parse: (cr) => {
    const result = cr.one("SSLRevokeCertificateResult");
    return {
      isSuccess: result.boolean("IsSuccess"),
      certificateID: result.number("CertificateID"),
    };
  },
});

export const sslCommands = {
  create,
  getList,
  parseCSR,
  getApproverEmailList,
  activate,
  resendApproverEmail,
  reissue,
  resendFulfillmentEmail,
  editDCVMethod,
  getInfo,
  renew,
  purchaseMoreSans,
  revokeCertificate,
};
