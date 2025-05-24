import type { SSLListSortBy, SSLListType, SSLType } from "@fwg/types/enum";

type CreateSSLYearLimit = 1 | 2 | 3 | 4 | 5;

export interface CreateSSLParams {
  year: CreateSSLYearLimit;
  type: SSLType;
  sansToADD?: number;
  promotionCode?: string;
}

export interface GetListSSLParams {
  listType?: SSLListType;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: SSLListSortBy;
}

export interface ParseCSRSSLParams {
  csr: string;
  certificateType?: SSLType;
}

export interface GetApproverEmailListSSLParams {
  domainName: string;
  certificateType?: SSLType;
}

export interface ActivateSSLCommonParams {
  certificateId: number;
  csr: string;
  adminEmailAddress: string;
  webServerType?: string;
  uniqueValue?: string;
}

export interface SSLDCVParams extends ActivateSSLCommonParams {
  approverEmail?: string;
  HTTPDCValidation?: boolean;
  DNSDCValidation?: boolean;
}

export interface SSLMultiDomainParams extends ActivateSSLCommonParams {
  DNSNames?: string;
  DNSApproverEmails?: string;
}

export interface SSLOVAndEVParams extends ActivateSSLCommonParams {
  adminOrganizationName?: string;
  organizationDepartment?: string;
  DNSNames?: string;
  DNSApproverEmails?: string;
  adminCountry?: string;
  adminStateProvince?: string;
  adminCity?: string;
  adminAddress1?: string;
  adminAddress2?: string;
  adminPostalCode?: string;
  adminPhone?: string;
  organizationDUNS?: string;
}

export interface SSLEVParams extends ActivateSSLCommonParams {
  companyIncorporationCountry: string;
  companyIncorporationStateProvince?: string;
  companyIncorporationLocality?: string;
  companyIncorporationDate?: string;
  companyDBA?: string;
  companyRegistrationNumber?: string;
}

export interface SSLOVParams extends ActivateSSLCommonParams {
  organizationRepFirstName?: string;
  organizationRepLastName?: string;
  organizationRepTitle?: string;
  organizationRepPhone?: string;
  organizationRepEmailAddress?: string;
}

export type SSLParams =
  | SSLDCVParams
  | SSLMultiDomainParams
  | SSLOVAndEVParams
  | SSLEVParams
  | SSLOVParams;
export type ActivateSSLParams = SSLParams;
export type ReissueSSLParams = SSLParams;

export interface RenewSSLParams {
  certificateId: number;
  years: number;
  sslType: SSLType;
  promotionCode?: string;
}

export interface EditDCVMethodParams {
  certificateId: number;
  DCVMethod: string;
  DNSNames: string;
  DCVMethods: string;
}
