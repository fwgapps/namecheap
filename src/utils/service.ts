import {parseStringPromise} from "xml2js";
import type { NamecheapProps } from "../types/config.type";
import {
    NamecheapCommandResponseWithSuccessMap, NamecheapParamsMap,
    NamecheapResponse,
    NamecheapResponseWithErrors,
    NamecheapResponseWithSuccess
} from "../types/response.type";
import {removeUndefinedKeys, transformBoolean, transformNumber} from "./xml";

function capitalizeFirstLetter(input: string): string {
    if (!input) return input; //
    return input.charAt(0).toUpperCase() + input.slice(1);
}


export const getNamecheapHost = (isSandbox: boolean) => {
    const host = !isSandbox ? "api.namecheap.com" : "api.sandbox.namecheap.com";
    return `https://${host}/xml.response`;
};

const checkRequestError = (response: NamecheapResponse) => {
    return "Errors" in response && response.Errors && Object.keys(response.Errors).length > 0;
};



function flattenObjectToArray(input: Record<string, any>, prefix = ""): Array<[string, string]> {
    const result: Array<[string, string]> = [];

    Object.entries(input).forEach(([key, value]) => {
        const capitalizedKey = `${prefix}${capitalizeFirstLetter(key)}`;

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            result.push(...flattenObjectToArray(value, capitalizedKey));
        } else if (value !== undefined && value !== null) {
            result.push([capitalizedKey, String(value)]);
        }
    });

    return result;
}



export async function request<T extends keyof NamecheapCommandResponseWithSuccessMap>(
    namecheapProps: NamecheapProps, 
    command: T,
    params: NamecheapParamsMap[T] = {} as NamecheapParamsMap[T]
) {
    const { apiUser, apiKey, apiUrl, username, clientIp} = namecheapProps;

    let url = new URL(apiUrl);
    url.searchParams.append("ApiUser", apiUser);
    url.searchParams.append("ApiKey", apiKey);
    url.searchParams.append("UserName", username);
    url.searchParams.append("ClientIp", clientIp);
    url.searchParams.append("Command", command);

    flattenObjectToArray(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString());


    if (!response.ok) {
        throw new Error(`Error in API Namecheap: ${response.statusText}`);
    }

    const xmlData =  await response.text();


    const json: NamecheapResponse<NamecheapCommandResponseWithSuccessMap[T]> = await parseStringPromise(xmlData, {
        explicitArray: false,
        normalize: true,
        explicitRoot: false,
        emptyTag: undefined,
        valueProcessors: [transformNumber, transformBoolean],
        attrValueProcessors: [transformNumber, transformBoolean]
    });

    if(checkRequestError(json)){
        throw (json as NamecheapResponseWithErrors);
    }

    return removeUndefinedKeys<NamecheapCommandResponseWithSuccessMap[T]>(json);
}