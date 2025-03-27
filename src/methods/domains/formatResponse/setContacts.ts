import {
    NamecheapDomainsSetContact,
    NamecheapResponseWithSuccess,
} from "../../../types/response.type";
import {ResponseFormatted} from "../../../utils/format/type";

type SetContactResponseFormatted = ResponseFormatted<boolean>

export const formatSetContactResponseSuccess = (response: NamecheapResponseWithSuccess<NamecheapDomainsSetContact>): SetContactResponseFormatted => ({
    status: response.$.Status,
    data: !!response.CommandResponse.DomainSetContactResult?.$?.IsSuccess
})