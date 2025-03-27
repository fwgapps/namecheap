import {NamecheapResponseWithErrors, Status} from "../../types/response.type";

interface ErrorResponseFormatted {
    status: Status
    code: number;
    message: string;
}

export const formatResponseError = (response: NamecheapResponseWithErrors): ErrorResponseFormatted => {
   if(typeof response.$ === "undefined"){
       return ({
           status: "error",
           code: -1,
           message: "Unknown error in namecheap library"
       });
   }

    return ({
        status: response.$.Status.toLowerCase() as Status,
        code: response.Errors.Error.$.Number,
        message: response.Errors.Error._
    });
}