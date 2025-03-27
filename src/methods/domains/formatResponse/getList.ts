import type {
    Domain,
    NamecheapDomainsGetList,
    NamecheapResponseWithSuccess, Status,
    TagAttribute
} from "../../../types/response.type";
import {ResponseFormatted} from "../../../utils/format/type";

interface GetListResponseFormatted extends ResponseFormatted<Array<{
    id: number;
    name: string;
    user: string;
    created: string;
    expires: string;
    isExpired: boolean;
    isLocked: boolean;
    autoRenew: boolean;
    whoisGuard: string;
}>>{}

export const formatGetListResponseSuccess = (response: NamecheapResponseWithSuccess<NamecheapDomainsGetList>): GetListResponseFormatted => {
    let domains: Array<TagAttribute<Domain>> = [];

    if(!!response?.CommandResponse?.DomainGetListResult?.Domain){
        domains = Array.isArray(response.CommandResponse.DomainGetListResult.Domain) ? response.CommandResponse.DomainGetListResult.Domain : [response.CommandResponse.DomainGetListResult.Domain];
    }

    return ({
        status: response.$.Status.toLowerCase() as Status,
        data: domains.map(domain => ({
            id: domain.$.ID,
            name: domain.$.Name,
            user: domain.$.User,
            created: domain.$.Created,
            expires: domain.$.Expires,
            isExpired: domain.$.IsExpired,
            isLocked: domain.$.IsLocked,
            autoRenew: domain.$.AutoRenew,
            whoisGuard: domain.$.WhoisGuard,
            isPremium: domain.$.IsPremium,
            isOurDNS: domain.$.IsOurDNS,
        }))
    });
}