import {
    DomainCheck,
    DomainsCheck,
    NamecheapDomainsCheck,
    NamecheapResponseWithSuccess,
} from "../../../types/response.type";
import {ResponseFormatted} from "../../../utils/format/type";

type CheckDomainsFormatted = {
    domain: string,
    isAvailable: boolean,
    description?: string,
    premium?: {
        isPremium: boolean,
        price: {
            registration: number,
            renewal: number,
            restore: number,
            transfer: number,
        }
    },
    icannFee: number,
    eapFee: number
}

type SetCheckResponseFormatted = ResponseFormatted<Array<CheckDomainsFormatted>>

const formatCheckResult = (rawCheckResult: DomainsCheck) => {
    if(!rawCheckResult) return [];

    const checkDomains: Array<CheckDomainsFormatted> = [];
    if(typeof rawCheckResult.$ !== "undefined"){
        checkDomains.push({
            description: (rawCheckResult as DomainCheck).$.Description,
            eapFee: (rawCheckResult as DomainCheck).$.EapFee,
            icannFee: (rawCheckResult as DomainCheck).$.IcannFee,
            isAvailable: (rawCheckResult as DomainCheck).$.Available,
            premium: {
                isPremium: (rawCheckResult as DomainCheck).$.IsPremiumName,
                price: {
                    registration: (rawCheckResult as DomainCheck).$.PremiumRegistrationPrice,
                    renewal: (rawCheckResult as DomainCheck).$.PremiumRenewalPrice,
                    restore: (rawCheckResult as DomainCheck).$.PremiumRestorePrice,
                    transfer: (rawCheckResult as DomainCheck).$.PremiumTransferPrice,
                }
            },
            domain: (rawCheckResult as DomainCheck).$.Domain,
        })
    } else if(typeof rawCheckResult === "object"){
        Object.values(rawCheckResult).forEach(checkDomain => {
            checkDomains.push(...formatCheckResult(checkDomain))
        })
    }

    return checkDomains;
}

export const formatCheckResponseSuccess = (response: NamecheapResponseWithSuccess<NamecheapDomainsCheck>): SetCheckResponseFormatted =>
    ({
        status: response.$.Status,
        data: formatCheckResult(response.CommandResponse.DomainCheckResult)
    })