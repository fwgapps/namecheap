import {NamecheapDomainsCreate, NamecheapResponseWithSuccess, Status} from "../../../types/response.type";
import {ResponseFormatted} from "../../../utils/format/type";

interface DomainCreateResponse {
    domain: string,
    registered: boolean,
    chargedAmount: number,
    domainId: number,
    orderId: number,
    transactionId: number,
    whoIsGuardEnabled: boolean,
    nonRealTimeDomain: boolean
}

type GetContactResponseFormatted = ResponseFormatted<DomainCreateResponse>

export const formatCreateResponseSuccess = (response: NamecheapResponseWithSuccess<NamecheapDomainsCreate>): GetContactResponseFormatted => ({
    status: response.$.Status.toLowerCase() as Status,
    data: {
        domain: response.CommandResponse.DomainCreateResult.$.Domain,
        registered: response.CommandResponse.DomainCreateResult.$.Registered,
        chargedAmount: response.CommandResponse.DomainCreateResult.$.ChargedAmount,
        domainId: response.CommandResponse.DomainCreateResult.$.DomainID,
        orderId: response.CommandResponse.DomainCreateResult.$.OrderID,
        transactionId: response.CommandResponse.DomainCreateResult.$.TransactionID,
        whoIsGuardEnabled: response.CommandResponse.DomainCreateResult.$.WhoisguardEnable,
        nonRealTimeDomain: response.CommandResponse.DomainCreateResult.$.NonRealTimeDomain,
    }
})