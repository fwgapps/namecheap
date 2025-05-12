export enum ProductType {
    Domain = "DOMAIN",
    SslCertificate = "SSLCERTIFICATE"
}

export enum ProductCategory {
    Domains = "DOMAINS",
    Comodo = "COMODO"
}

export enum ActionName {
    Register = "REGISTER",
    Renew = "RENEW",
    Reactivate = "REACTIVATE",
    Transfer = "TRANSFER",
    Purchase = "PURCHASE",
}

export enum ProductName {
    COM = "COM",
    InstantSsl = "INSTANTSSL"
}

export interface GetPricingUserParams {
    productType: ProductType
    productCategory?: ProductCategory
    promotionCode?: string
    actionName?: ActionName
    productName?: ProductName
}

export interface ChangePasswordParams {
    oldPassword: string,
    newPassword: string
}

export interface UpdateParams {
    firstName: string
    lastName: string
    jobTitle?: string
    organization?: string
    address1: string
    address2?: string
    city: string
    stateProvince: string
    zip: string
    country: string
    emailAddress: string
    phone: string
    phoneExt?: string
    fax?: string
}

export type PaymentType = "Creditcard"

export interface CreateAddFundsRequestParams {
    username: string
    paymentType: PaymentType,
    amount: number,
    returnUrl: string
}

export interface GetAddFundsStatusParams {
    tokenId: string
}

export interface CreateUserParams {
    newUserName: string,
    newUserPassword: string
    emailAddress: string
    ignoreDuplicateEmailAddress?: string
    firstName: string
    lastName: string
    acceptTerms: number
    acceptNews?: number
    jobTitle?: string
    organization?: string
    address1: string
    address2?: string
    city: string
    stateProvince: string
    zip: string
    country: string
    phone: string
    phoneExt?: string
    fax?: string
}

export interface LoginUserParams {
    password: string
}

export enum FindBy {
    EmailAddress = "EMAILADDRESS",
    DomainName = "DOMAINNAME",
    Username = "USERNAME",
}

export interface ResetPasswordParams {
    findBy: FindBy,
    findByValue: string,
    emailFromName?: string,
    emailFrom?: string,
    urlPattern?: string
}