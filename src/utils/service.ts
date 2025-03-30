import { XMLParser } from "fast-xml-parser";
import {camelCase, pascalCase} from "change-case";
import type { NamecheapProps } from "../types/config.type";
import { simplifyObject} from "./xml";
import {NamecheapXMLParsedBase, NamecheapXMLParsedFail, NamecheapXMLParsedSuccess} from "../types/methods/base.type";
import {MappedDomain, NamecheapParamsMap} from "../types/methods/mapped.type";

export const getNamecheapHost = (isSandbox: boolean) => {
    const host = !isSandbox ? "api.namecheap.com" : "api.sandbox.namecheap.com";
    return `https://${host}/xml.response`;
};

const checkRequestError = (response: NamecheapXMLParsedBase | NamecheapXMLParsedFail) => response.status === "ERROR" || Object.hasOwn(response, "errors")

const flattenObjectToArray = (input: Record<string, any>, prefix = ""): Array<[string, string]> => {
    const result: Array<[string, string]> = [];

    Object.entries(input).forEach(([key, value]) => {
        const capitalizedKey = pascalCase(`${prefix} ${key}`);

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            result.push(...flattenObjectToArray(value, capitalizedKey));
        } else if (value !== undefined && value !== null) {
            result.push([capitalizedKey, String(value)]);
        }
    });

    return result;
}

const tagNamesArray = [
    "apiResponse.commandResponse.tlds.tld",
    "apiResponse.commandResponse.tlds.tld.categories",
    "apiResponse.commandResponse.domainGetListResult.domain",
    "apiResponse.commandResponse.domainCheckResult"
];

const parser = new XMLParser({
    allowBooleanAttributes: true,
    attributeNamePrefix: "",
    ignoreAttributes: false,
    processEntities: true,
    parseTagValue: true,
    parseAttributeValue: true,
    trimValues: true,
    isArray: (_tagName, jPath) => {
        return tagNamesArray.includes(jPath);
    },
    transformTagName: (tagName) => camelCase(tagName),
    transformAttributeName: (attributeName) => camelCase(attributeName),
});

export async function request<T extends keyof MappedDomain>(
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

    const json: NamecheapXMLParsedBase = simplifyObject(parser.parse(xmlData)?.apiResponse);

    if(checkRequestError(json)){
        throw (json as NamecheapXMLParsedFail);
    }

    return json as NamecheapXMLParsedSuccess<MappedDomain[T]>
}