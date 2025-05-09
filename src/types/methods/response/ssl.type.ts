export interface SSLCertificate {
    certificateId: number,
    created: string,
    sslType: string,
    years: number,
    status: string

}

export interface SSLCreateResult {
    sslCertificate: SSLCertificate,
    isSuccess: boolean,
    orderId: number,
    transactionId: number,
    chargedAmount: number

}

export interface SSLCreateBaseResult {
    sslCreateResult: SSLCreateResult
}

export interface SSLResult {
    certificateId: number,
    hostName: string,
    sslType: string,
    purchaseDate: string,
    expireDate: string,
    activationExpireDate: string,
    isExpiredYn: boolean,
    status: string
}

export interface SSLGetListBaseResult {
    sslListResult: Array<SSLResult>
}

export interface SSLParseCsrResult {
    commonName: string,
    domainName: string,
    country: string,
    organisationUnit: string,
    organisation: string,
    validTrueDomain: boolean,
    state: string,
    locality: string,
    email: string,
    dnsNames: string,
    csrDetails: boolean
}

export interface SSLParseCsrBaseResult {
    sslParseCsrResult: SSLParseCsrResult
}

export interface GetApproverEmailListResult {
    domainemails: string,
    genericemails: Array<string>,
    domain: string
}

export interface SSLGetApproverEmailListBaseResult {
    getApproverEmailListResult: GetApproverEmailListResult
}

export interface SSLActivateResult {
    httpDcValidation: {
        fileName: string,
        fileContent: string,
        domain: string
    },
    dnsdcValidation: {
        hostName: string,
        target: string,
        domain: string
    },
    id: number,
    isSuccess: boolean
}

export interface SSLActivateBaseResult {
    sslActivateResult:SSLActivateResult
}

export interface SSLResendApproverEmailBaseResult {
    sslResendApproverEmailResult: number
}

export interface SSLGetInfoResult {
    certificateDetails: {
        csr: string,
        approverEmail: string,
        commonName: string,
        administratorName: string,
        administratorEmail: string,
        certificates: {
            certificate: string,
            caCertificates: Array<{
                certificate: string,
                type: string,
            }>,
            certificateReturned: boolean,
            returnType: string
        },
        certificateDetails: boolean
    },
    provider: {
        orderId: number,
        name: string,
        provider: boolean
    },
    status: string,
    statusDescription: string,
    type: string,
    issuedOn: string,
    expires: string,
    orderId: number,
    replacedBy: number,
    sansCount: number
}

export interface SSLGetInfoBaseResult {
    sslGetInfoResult: SSLGetInfoResult
}

export interface SSLRenewResult {
    certificateId: number,
    sslType: string,
    years: number,
    orderId: number,
    transactionId: number,
    chargedAmount: number
}

export interface SSLRenewBaseResult {
    sslRenewResult: SSLRenewResult
}

export interface SSLResendFulfillmentEmailBaseResult {
    sslResendFulfillmentEmailResult: number
}

export interface SSLPurchaseMoreSansResult{
    sslCertificate: {
        certificateId: number,
            sslType: string,
            years: number,
            status: string,
            sansCount: number
    },
    isSuccess: boolean,
    orderId: number,
    transactionId: number,
    chargedAmount: number
}

export interface SSLPurchaseMoreSansBaseResult{
    sslPurchaseMoreSansResult: SSLPurchaseMoreSansResult
}

export interface RevokeCertificateBaseResult {
    revokeCertificateResult: number
}

export interface SSLEditDcvMethodResult {
    httpDcValidation: {
        fileName: string,
            fileContent: string
        valueAvailable: boolean
    },
    dnsdcValidation: {
        hostName: string,
        target: string,
        valueAvailable: boolean
    },
    domains: { domains: boolean },
    id: number,
    isSuccess: boolean
}

export interface SSLEditDcvMethodBaseResult {
    sslEditDcvMethodResult: SSLEditDcvMethodResult
}
