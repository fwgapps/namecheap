import type { Paging } from "./base.type";

/**
 * Interface representing the structure of a successful response for a domain list retrieval operation.
 */
export interface GetListSuccess {
    domainGetListResult: Array<{
        id: number,
        name: string,
        user: string,
        created: string,
        expires: string,
        isExpired: boolean,
        isLocked: boolean,
        autoRenew: boolean,
        whoisGuard: string,
        isPremium: boolean,
        isOurDns: boolean
    }>,
    paging: Paging
}

/**
 * Represents the collection of contact details associated with different roles.
 *
 * This interface is used to store and structure contact information for
 * registrants, technical contacts, administrative contacts, and auxiliary billing contacts.
 *
 * Each property corresponds to a different role and contains detailed
 * contact information through the `ContactDetail` interface.
 */
export interface Contacts {
    registrant: ContactDetail,
    tech: ContactDetail,
    admin: ContactDetail,
    auxBilling: ContactDetail,
}

/**
 * Represents the contact details for an individual or organization.
 *
 * This interface defines the structure for commonly used contact information
 * such as names, addresses, communication details, and additional metadata.
 *
 * Properties:
 * - organizationName: The name of the organization associated with the contact.
 * - jobTitle: The job title or role of the contact individual.
 * - firstName: The first name of the individual contact.
 * - lastName: The last name of the individual contact.
 * - address1: The primary address line for the contact.
 * - address2: The secondary address line, if applicable.
 * - city: The city where the contact is located.
 * - stateProvince: The state or province of the contact's location.
 * - stateProvinceChoice: Specific state or province choice when applicable.
 * - postalCode: The postal or zip code corresponding to the contact's address.
 * - country: The name of the country of the contact.
 * - phone: The primary phone number for the contact.
 * - fax: The fax number associated with the contact, if available.
 * - emailAddress: The primary email address associated with the contact.
 * - phoneExt: The phone number extension, if applicable.
 * - readOnly: A flag indicating whether the contact details are read-only.
 */
export interface ContactDetail {
    organizationName: string,
    jobTitle: string,
    firstName: string,
    lastName: string,
    address1: string,
    address2: string,
    city: string,
    stateProvince: string,
    stateProvinceChoice: string,
    postalCode: number,
    country: string,
    phone: number,
    fax: number,
    emailAddress: string,
    phoneExt: number,
    readOnly: boolean
}

/**
 * Represents the attributes related to the current registrant.
 *
 * This interface provides properties that define key details about the
 * registrant's nexus and purpose.
 *
 * @interface
 */
interface CurrentAttributes {
    registrantNexus: string,
    registrantPurpose: string
}

/**
 * Represents the successful retrieval of contact information for a specific domain.
 *
 * @interface GetContactSuccess
 *
 * @property {object} domainContactsResult - Contains detailed information about the contact associated with the domain.
 * @property {object} domainContactsResult.currentAttributes - Represents the current attributes associated with the domain.
 * @property {object} domainContactsResult.whoisGuardContact - Provides information about whether WHOIS guard protection is enabled along with the contact details.
 * @property {boolean} domainContactsResult.whoisGuardContact.whoisGuardContact - Indicates if WHOIS guard protection is activated for the domain contact.
 * @property {string} domainContactsResult.domain - Represents the domain name.
 * @property {number} domainContactsResult.domainnameid - Represents the unique identifier for the domain name.
 */
export interface GetContactSuccess {
    domainContactsResult: Contacts & {
        currentAttributes: CurrentAttributes,
        whoisGuardContact: Contacts & {
            whoisGuardContact: boolean
        },
        domain: string,
        domainnameid: number
    }
}

/**
 * Represents the outcome of a successful domain creation operation.
 *
 * @interface CreateSuccess
 * @property {string} domain - The name of the domain that was successfully created.
 * @property {boolean} registered - Indicates whether the domain has been successfully registered.
 * @property {number} chargedAmount - The amount charged for the domain registration.
 * @property {number} domainID - The unique identifier for the created domain.
 * @property {number} orderID - The unique identifier for the order associated with the domain creation.
 * @property {number} transactionID - The unique identifier for the transaction used during the process.
 * @property {boolean} whoisguardEnable - Indicates whether WhoisGuard protection is enabled for the domain.
 * @property {boolean} nonRealTimeDomain - Indicates if the domain is a non-real-time domain requiring additional processing time.
 */
export interface CreateSuccess {
    domain: string,
    registered: boolean,
    chargedAmount: number,
    domainID: number,
    orderID: number,
    transactionID: number,
    whoisguardEnable: boolean,
    nonRealTimeDomain: boolean
}

/**
 * Represents a category with a name and a sequence number.
 *
 * @interface Category
 * @property {string} name - The name of the category.
 * @property {number} sequenceNumber - The sequence number of the category, typically used for ordering.
 */
interface Category {
    name: string,
    sequenceNumber: number,
}

/**
 * Represents the successful response containing a list of Top-Level Domains (TLDs) and their attributes in the system.
 */
export interface GetTldListSuccess {
   tlds: Array<{
       name: string,
       nonRealTime: boolean,
       minRegisterYears: number,
       maxRegisterYears: number,
       minRenewYears: number,
       maxRenewYears: number,
       renewalMinDays: number,
       renewalMaxDays: number,
       reactivateMaxDays: number,
       minTransferYears: number,
       maxTransferYears: number,
       isApiRegisterable: boolean,
       isApiRenewable: boolean,
       isApiTransferable: boolean,
       isEppRequired: boolean,
       isDisableModContact: boolean,
       isDisableWGAllot: boolean,
       isIncludeInExtendedSearchOnly: boolean,
       sequenceNumber: number,
       type: string,
       subType: string,
       isSupportsIDN: boolean,
       category: string,
       supportsRegistrarLock: boolean,
       addGracePeriodDays: number,
       whoisVerification: boolean,
       providerApiDelete: boolean,
       tldState: string,
       searchGroup: string,
       registry: string
       categories: Array<Category>
   }>
}

/**
 * Represents the result of a successful operation to set contact information for a domain.
 *
 * @interface SetContactSuccess
 */
export interface SetContactSuccess {
    domainSetContactResult: string
}

/**
 * Represents the result of a domain check operation.
 */
export interface CheckSuccess {
    domainCheckResult: {
        domain: string,
        available: boolean,
        errorNo: number,
        isPremiumName: boolean,
        premiumRegistrationPrice: number,
        premiumRenewalPrice: number,
        premiumRestorePrice: number,
        premiumTransferPrice: number,
        icannFee: number,
        eapFee: number
    }
}

/**
 * Represents the response for a domain reactivation operation.
 *
 * This interface provides the structure for containing details about the reactivation
 * of a domain, including the domain name, status of the operation, associated charges,
 * and related transaction details.
 */
export interface ReactiveSuccess {
    domainReactivateResult: {
        domain: string,
        isSuccess: boolean,
        chargedAmount: number,
        orderId: number,
        transactionId: number
    }
}

/**
 * Represents the successful renewal of a domain.
 *
 * This interface provides details about a domain renewal process,
 * including domain information, renewal status, and transaction details.
 */
export interface RenewSuccess {
    domainRenewResult: {
        domainDetails: {
            expiredDate: string,
            numYears: number,
            domainDetails: boolean
        },
        domainName: string,
        domainId: number,
        renew: true,
        orderId: number,
        transactionId: number,
        chargedAmount: number
    }
}

/**
 * Represents the successful response structure for retrieving registrar lock information for a domain.
 *
 * This interface contains details about the domain and its associated registrar lock status,
 * along with related domain status flags.
 *
 * @interface GetRegistrarLockSuccess
 * @property {Object} domainGetRegistrarLockResult - Contains detailed information about the domain's registrar lock status.
 * @property {string} domainGetRegistrarLockResult.domain - The name of the domain.
 * @property {boolean} domainGetRegistrarLockResult.registrarLockStatus - Indicates whether the registrar lock is enabled for the domain.
 * @property {boolean} domainGetRegistrarLockResult.isClientUpdateProhibited - Indicates if the domain is prohibited from being updated by the client.
 * @property {boolean} domainGetRegistrarLockResult.isClientDeleteProhibited - Indicates if the domain is prohibited from being deleted by the client.
 * @property {boolean} domainGetRegistrarLockResult.isClientHold - Indicates if the domain is currently placed on client hold.
 */
export interface GetRegistrarLockSuccess {
    domainGetRegistrarLockResult: {
        domain: string,
        registrarLockStatus: boolean,
        isClientUpdateProhibited: boolean,
        isClientDeleteProhibited: boolean,
        isClientHold: boolean
    },
}

/**
 * Represents the result of setting the registrar lock status for a specific domain.
 *
 * This interface includes properties related to the operation's success and various
 * status updates associated with the registrar lock and related domain statuses.
 *
 * @property {Object} domainSetRegistrarLockResult - The result object containing details about the registrar lock operation.
 * @property {string} domainSetRegistrarLockResult.domain - The domain name for which the registrar lock status is being modified.
 * @property {boolean} domainSetRegistrarLockResult.isSuccess - Indicates if the operation to set the registrar lock was successful.
 * @property {boolean} domainSetRegistrarLockResult.registrarLockStatus - The current status of the registrar lock for the domain.
 * @property {boolean} domainSetRegistrarLockResult.isRegistrarLockStatusUpdated - Specifies if the registrar lock status was updated as part of the operation.
 * @property {boolean} domainSetRegistrarLockResult.isClientUpdateProhibitedUpdated - Indicates if the client update prohibited status has been updated.
 * @property {boolean} domainSetRegistrarLockResult.isClientDeleteProhibitedUpdated - Indicates if the client delete prohibited status has been updated.
 * @property {boolean} domainSetRegistrarLockResult.isClientHoldUpdated - Indicates if the client hold status has been updated.
 */
export interface SetRegistrarLockSuccess {
    domainSetRegistrarLockResult: {
        domain: string,
        isSuccess: boolean,
        registrarLockStatus: boolean,
        isRegistrarLockStatusUpdated: boolean,
        isClientUpdateProhibitedUpdated: boolean,
        isClientDeleteProhibitedUpdated: boolean,
        isClientHoldUpdated: boolean
    }
}

/**
 * Interface representing the successful response structure for getting domain information.
 */
export interface GetInfoSuccess {
    domainGetInfoResult: {
        domainDetails: {
            createdDate: string,
            expiredDate: string,
            numYears: number,
            domainDetails: boolean
        },
        whoisguard: { id: number, enabled: string },
        premiumDnsSubscription: {
            useAutoRenew: boolean,
            subscriptionId: number,
            createdDate: string,
            expirationDate: string,
            isActive: boolean,
            premiumDnsSubscription: boolean
        },
        dnsDetails: {
            nameserver: Array<string>,
            providerType: string,
            isUsingOurDns: boolean,
            hostCount: number,
            emailType: string,
            dynamicDnsStatus: boolean,
            isFailover: boolean
        },
        modificationrights: { all: boolean },
        status: string,
        id: number,
        domainName: string,
        ownerName: string,
        isOwner: boolean,
        isPremium: boolean
    },

}