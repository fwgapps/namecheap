import {CommandsDomain} from "../utils/commands";

export type TagAttribute<T> = Record<"$", T>
export type ElementValue<T> = Record<"_", T>

interface Error extends TagAttribute<{
    Number: number
}>, ElementValue<string>{}

export type Status = "ok" | "error";

type RootTagAttribute = TagAttribute<{
    xmlns: string;
    Status: Status;
}>;

interface Paging {
    TotalItems: number,
    CurrentPage: number,
    PageSize: number
}

interface CommandResponseBase extends TagAttribute<{
    Type: string;
}>{}

export interface Domain {
    ID: number,
    Name: string
    User: string
    Created: string
    Expires: string
    IsExpired: boolean
    IsLocked: boolean
    AutoRenew: boolean
    WhoisGuard: string
    IsPremium: boolean
    IsOurDNS: boolean
}

type CommandResponse<T = {}> = T & CommandResponseBase;

export interface NamecheapResponseBase extends RootTagAttribute{
    Server: string;
    GMTTimeDifference: string;
    ExecutionTime: number;
}

export interface NamecheapResponseWithErrors extends NamecheapResponseBase {
    Errors: {
        Error: Error
    }
}

export interface NamecheapResponseWithSuccess<T = {}> extends NamecheapResponseBase {
    Warnings?: unknown;
    RequestedCommand: string;
    CommandResponse: CommandResponse<T>;
}

export type NamecheapResponse<T = {}> = NamecheapResponseWithSuccess<T> | NamecheapResponseWithErrors;

export interface DomainGetListResult {
    Domain: TagAttribute<Domain> | Array<TagAttribute<Domain>>
}

export interface NamecheapDomainsGetList {
    DomainGetListResult?: DomainGetListResult
    Paging: Paging
}

interface DomainContacts {
    Registrant: DomainContact,
    Tech: DomainContact,
    Admin: DomainContact,
    AuxBilling: DomainContact,
}

export interface DomainContact extends TagAttribute<{
    ReadOnly: boolean
}>{
    OrganizationName: string,
    JobTitle: string,
    FirstName: string,
    LastName: string,
    Address1: string,
    Address2: string,
    City: string,
    StateProvince: string,
    StateProvinceChoice: string,
    PostalCode: number,
    Country: string,
    Phone: number,
    Fax: number,
    EmailAddress: string,
    PhoneExt: number
}

interface CurrentAttributes {
    RegistrantNexus: string,
    RegistrantPurpose: string
}

export interface DomainContactsResult extends DomainContacts, TagAttribute<{
    Domain: string,
    domainnameid: number
}>{
    CurrentAttributes: CurrentAttributes,
    WhoisGuardContact: DomainContacts
}

export interface NamecheapDomainsGetContact {
    DomainContactsResult?: DomainContactsResult
}

export interface NamecheapDomainsCreate {
    DomainCreateResult: TagAttribute<{
        Domain: string,
        Registered: boolean,
        ChargedAmount: number,
        DomainID: number,
        OrderID: number,
        TransactionID: number,
        WhoisguardEnable: boolean,
        NonRealTimeDomain: boolean

    }>
}


export type TldCategories = TldCategory | Record<string, TldCategory>;

export interface TLD extends ElementValue<string>, TagAttribute<{
    Name: string,
    NonRealTime: boolean,
    MinRegisterYears: number,
    MaxRegisterYears: number,
    MinRenewYears: number,
    MaxRenewYears: number,
    RenewalMinDays: number,
    RenewalMaxDays: number,
    ReactivateMaxDays: number,
    MinTransferYears: number,
    MaxTransferYears: number,
    IsApiRegisterable: boolean,
    IsApiRenewable: boolean,
    IsApiTransferable: boolean,
    IsEppRequired: boolean,
    IsDisableModContact: boolean,
    IsDisableWGAllot: boolean,
    IsIncludeInExtendedSearchOnly: boolean,
    SequenceNumber: number,
    Type: string,
    SubType: string,
    IsSupportsIDN: boolean,
    Category: string,
    SupportsRegistrarLock: boolean,
    AddGracePeriodDays: number,
    WhoisVerification: boolean,
    ProviderApiDelete: boolean,
    TldState: string,
    SearchGroup: string,
    Registry: string
}>{
    Categories: {
        TldCategory: TldCategories
    }
}

export type TldCategory = ElementValue<string> & TagAttribute<{
    Name: string,
    SequenceNumber: number,
}>

export interface TLDS {
    Tld: ElementValue<string> & TagAttribute<TLD>,
}

export interface NamecheapDomainsTldList {
    Tlds: Record<string, { Tld: TLD }>
}

export interface NamecheapDomainsSetContact {
    DomainSetContactResult: TagAttribute<{
        Domain: string,
        IsSuccess: boolean
    }>
}

export type DomainCheck = TagAttribute<{
    Domain: string,
    Available: boolean,
    ErrorNo: number,
    Description: string,
    IsPremiumName: boolean,
    PremiumRegistrationPrice: number,
    PremiumRenewalPrice: number,
    PremiumRestorePrice: number,
    PremiumTransferPrice: number,
    IcannFee: number,
    EapFee: number
}>

export type DomainsCheck = DomainCheck | Record<string, DomainCheck>;


export interface NamecheapDomainsCheck {
    DomainCheckResult: DomainsCheck
}



export type NamecheapCommandResponseWithSuccessMap = {
    [CommandsDomain.GetList]: NamecheapResponseWithSuccess<NamecheapDomainsGetList>
    [CommandsDomain.GetContact]: NamecheapResponseWithSuccess<NamecheapDomainsGetContact>
    [CommandsDomain.Create]: NamecheapResponseWithSuccess<NamecheapDomainsCreate>
    [CommandsDomain.GetTldList]: NamecheapResponseWithSuccess<NamecheapDomainsTldList>
    [CommandsDomain.SetContact]: NamecheapResponseWithSuccess<NamecheapDomainsSetContact>
    [CommandsDomain.Check]: NamecheapResponseWithSuccess<NamecheapDomainsCheck>
};

export interface GetContactParams {
    domainName: string
}

interface PersonDetail {
    organizationName?: string,
    jobTitle?: string
    firstName: string,
    lastName: string,
    address1: string,
    address2?: string,
    city: string,
    stateProvince: string,
    stateProvinceChoice?: string
    postalCode: string,
    country: string,
    phone: string,
    phoneExt?: string,
    fax?: string,
    emailAddress: string,
}

export interface CreateDomain {
    domainName: string,
    years: number,
    promoCode?: string,
    registrant:PersonDetail,
    tech: PersonDetail,
    admin : PersonDetail,
    auxBilling: PersonDetail,
    billing?: Partial<PersonDetail>,
    idnCode?: string,
    extendedAttributes: string,
    nameservers?: string,
    addFreeWhoisguard?: string,
    WGEnabled?: string,
    isPremiumDomain?: boolean,
    premiumPrice?: number,
    eapPrice?: number
}

export interface ContactDomain {
    domainName: string,
    registrant:PersonDetail,
    tech: PersonDetail,
    admin : PersonDetail,
    auxBilling: PersonDetail,
    extendedAttributes: string
}

interface EmptyParams {}

export type NamecheapParamsMap = {
    [CommandsDomain.GetList]: EmptyParams
    [CommandsDomain.GetContact]: GetContactParams
    [CommandsDomain.Create]: CreateDomain
    [CommandsDomain.GetTldList]: EmptyParams
    [CommandsDomain.SetContact]: ContactDomain
    [CommandsDomain.Check]: EmptyParams
}