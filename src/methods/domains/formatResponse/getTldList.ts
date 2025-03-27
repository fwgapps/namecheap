import {
    NamecheapDomainsTldList,
    NamecheapResponseWithSuccess, Status,
    TLD, TldCategories, TldCategory
} from "../../../types/response.type";
import {ResponseFormatted} from "../../../utils/format/type";

interface TLDFormatted {
    name: string,
    nonRealTime: boolean,
    registerYears: {
        min: number,
        max: number
    },
    renewYears: {
        min: number,
        max: number
    },
    renewalDays: {
        min: number,
        max: number
    },
    reactivateMaxDays: number,
    transferYears: {
        min: number,
        max: number
    },
    isApi: {
        registerable: boolean,
        renewable: boolean,
        transferable: boolean,
    },
    isEppRequired: boolean,
    isDisable: {
        modContact: boolean,
        wGAllot: boolean,
    },
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
}

interface CategoriesFormatted {
    name: string,
    sequence: number,
}

const formatCategories = (rawCategories: TldCategories): Array<CategoriesFormatted> => {
    if(!rawCategories) return [];

    const categories: Array<CategoriesFormatted> = [];
    if(typeof rawCategories.$ !== "undefined"){
        categories.push({
            name: ((rawCategories as TldCategory).$.Name),
            sequence: ((rawCategories as TldCategory).$.SequenceNumber),
        })
    } else if(typeof rawCategories === "object"){
        Object.values(rawCategories).forEach(category => {
            categories.push(...formatCategories(category))
        })
    }

    return categories;
}

const formatTld = (data: TLD) =>
    ({
        name: data.$.Name,
        nonRealTime: data.$.NonRealTime,
        registerYears: {
            min: data.$.MinRegisterYears,
            max: data.$.MaxRegisterYears
        },
        renewYears: {
            min: data.$.MinRenewYears,
            max: data.$.MaxRenewYears
        },
        renewalDays: {
            min: data.$.RenewalMinDays,
            max: data.$.RenewalMaxDays
        },
        reactivateMaxDays: data.$.ReactivateMaxDays,
        transferYears: {
            min: data.$.MinTransferYears,
            max: data.$.MaxTransferYears
        },
        isApi: {
            registerable: data.$.IsApiRegisterable,
            renewable: data.$.IsApiRenewable,
            transferable: data.$.IsApiTransferable,
        },
        isEppRequired: data.$.IsEppRequired,
        isDisable: {
            modContact: data.$.IsDisableModContact,
            wGAllot: data.$.IsDisableWGAllot,
        },
        isIncludeInExtendedSearchOnly: data.$.IsIncludeInExtendedSearchOnly,
        sequenceNumber: data.$.SequenceNumber,
        type: data.$.Type,
        subType: data.$.SubType,
        isSupportsIDN: data.$.IsSupportsIDN,
        category: data.$.Category,
        supportsRegistrarLock: data.$.SupportsRegistrarLock,
        addGracePeriodDays: data.$.AddGracePeriodDays,
        whoisVerification: data.$.WhoisVerification,
        providerApiDelete: data.$.ProviderApiDelete,
        tldState: data.$.TldState,
        searchGroup: data.$.SearchGroup,
        registry: data.$.Registry,
        categories: formatCategories(data.Categories?.TldCategory)
    })

type GetTLDSListResponseFormatted = ResponseFormatted<Array<TLDFormatted>>

export const formatGetTldtListResponseSuccess = (response: NamecheapResponseWithSuccess<NamecheapDomainsTldList>): GetTLDSListResponseFormatted => {
    const data: Array<TLDFormatted> = (response.CommandResponse?.Tlds?.Tld && Object.values(response.CommandResponse?.Tlds.Tld) || []).map(formatTld);

    return ({
        status: response.$.Status.toLowerCase() as Status,
        data
    });
}