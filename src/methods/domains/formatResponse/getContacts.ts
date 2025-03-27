import {
    DomainContact, NamecheapDomainsGetContact,
    NamecheapResponseWithSuccess, Status,
} from "../../../types/response.type";
import {ResponseFormatted} from "../../../utils/format/type";


type GetContactResponseFormatted = ResponseFormatted<{
    domain: {
        id?: number;
        name?: string;
    };
    contacts: Partial<Contacts>;
    whoisGuardContact: Partial<Contacts>;
    registrantAttributes?: {
        nexus?: string,
        purpose?: string
    };
}>

interface Contacts {
    registrant: ContactData;
    tech: ContactData;
    admin: ContactData;
    billing: ContactData;
}

interface ContactData {
    data: {
        organizationName?: string;
        jobTitle?: string;
        firstName?: string;
        lastName?: string;
        address1?: string;
        address2?: string;
        city?: string;
        stateProvince?: string;
        stateProvinceChoice?: string;
        postalCode?: number;
        country?: string;
        phone?: number;
        fax?: number;
        emailAddress?: string;
        phoneExt?: number;
    },
    editable: boolean;
}

const formatContact = (contact?: DomainContact): ContactData | undefined => contact && ({
    data: {
        organizationName: contact.OrganizationName,
        jobTitle: contact.JobTitle,
        firstName: contact.FirstName,
        lastName: contact.LastName,
        address1: contact.Address1,
        address2: contact.Address2,
        city: contact.City,
        stateProvince: contact.StateProvince,
        stateProvinceChoice: contact.StateProvinceChoice,
        postalCode: contact.PostalCode,
        country: contact.Country,
        phone: contact.Phone,
        fax: contact.Fax,
        emailAddress: contact.EmailAddress,
        phoneExt: contact.PhoneExt,
    },
    editable: contact.$.ReadOnly
})

export const formatGetContactResponseSuccess = (response: NamecheapResponseWithSuccess<NamecheapDomainsGetContact>): GetContactResponseFormatted => {
    return {
        status: response.$.Status.toLowerCase() as Status,
        data: {
            domain: {
                id: response.CommandResponse.DomainContactsResult?.$.domainnameid,
                name: response.CommandResponse.DomainContactsResult?.$.Domain,
            },
            contacts: {
                registrant: formatContact(response.CommandResponse.DomainContactsResult?.Registrant),
                tech: formatContact(response.CommandResponse.DomainContactsResult?.Tech),
                admin: formatContact(response.CommandResponse.DomainContactsResult?.Admin),
                billing: formatContact(response.CommandResponse.DomainContactsResult?.AuxBilling),
            },
            whoisGuardContact: {
                registrant: formatContact(response.CommandResponse.DomainContactsResult?.WhoisGuardContact?.Registrant),
                tech: formatContact(response.CommandResponse.DomainContactsResult?.WhoisGuardContact?.Tech),
                admin: formatContact(response.CommandResponse.DomainContactsResult?.WhoisGuardContact?.Admin),
                billing: formatContact(response.CommandResponse.DomainContactsResult?.WhoisGuardContact?.AuxBilling),
            },
            registrantAttributes: {
                nexus: response.CommandResponse.DomainContactsResult?.CurrentAttributes?.RegistrantNexus,
                purpose: response.CommandResponse.DomainContactsResult?.CurrentAttributes?.RegistrantPurpose,
            },
        }
    };
}