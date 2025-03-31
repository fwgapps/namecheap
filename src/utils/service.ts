import { XMLParser } from "fast-xml-parser";
import { camelCase, pascalCase } from "change-case";
import { simplifyObject } from "./xml";
import type { NamecheapProps } from "../types/config.type";
import type { NamecheapXMLParsedBase, NamecheapXMLParsedFail, NamecheapXMLParsedSuccess } from "../types/methods/base.type";
import type { MappedDomain, NamecheapParamsMap } from "../types/methods/mapped.type";

/**
 * Generates the URL for the Namecheap API endpoint based on the environment.
 *
 * @param {boolean} isSandbox - Determines whether to use the sandbox environment.
 *                              If true, the sandbox URL is returned; otherwise, the production URL is returned.
 * @returns {string} The fully constructed URL for the Namecheap API endpoint.
 */
export const getNamecheapHost = (isSandbox: boolean): string => {
    const host = !isSandbox ? "api.namecheap.com" : "api.sandbox.namecheap.com";
    return `https://${host}/xml.response`;
};

/**
 * Determines if a request response contains an error.
 *
 * This function evaluates the provided response object to check whether
 * it indicates an error. An error is identified if the "status" property
 * of the response is equal to "ERROR" or if the response object contains
 * an "errors" property.
 *
 * @param {NamecheapXMLParsedBase | NamecheapXMLParsedFail} response - The parsed response object to evaluate.
 * @returns {boolean} True if the response indicates an error, otherwise false.
 */
const checkRequestError = (response: NamecheapXMLParsedBase | NamecheapXMLParsedFail): boolean => response.status === "ERROR" || Object.hasOwnProperty.call(response, "errors")

/**
 * Flattens a nested object into an array of key-value pairs where the keys are
 * transformed to a PascalCase format, optionally prefixed by a given string.
 *
 * @param {Record<string, any>} input - The object to be flattened. This can be a deeply nested object.
 * @param {string} [prefix=""] - An optional prefix to be added to each key in the flattened structure.
 * @returns {Array<[string, string]>} An array of key-value pairs where each key is in PascalCase,
 *                                    and values are converted to strings.
 */
/* eslint-disable */
const flattenObjectToArray = (input: Record<string, any>, prefix: string = ""): Array<[string, string]> => {
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

/**
 * An array containing strings that represent specific paths or structures
 * in an API response object. Each string corresponds to a key or nested
 * property within a JSON response, typically used for accessing or mapping
 * data within the response object. These paths can represent different
 * data points like top-level domains (TLDs), domain categories, or domain
 * check results.
 */
const tagNamesArray = [
    "apiResponse.commandResponse.tlds.tld",
    "apiResponse.commandResponse.tlds.tld.categories",
    "apiResponse.commandResponse.domainGetListResult.domain",
    "apiResponse.commandResponse.domainCheckResult"
];

/**
 * Configuration object for the XMLParser instance.
 *
**/
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

/**
 * Sends a request to the Namecheap API, constructs the query parameters using the provided properties,
 * and parses the XML response into JSON.
 *
 * @param {NamecheapProps} namecheapProps An object containing authentication and configuration details for the Namecheap API.
 * @param {T} command The specific API command to be executed.
 * @param {NamecheapParamsMap[T]} [params={}] Additional parameters required for the specific API command.
 * @return {Promise<NamecheapXMLParsedSuccess<MappedDomain[T]>>} The parsed JSON response representing the successful result of the API request.
 * @throws {Error} Throws an error if the API response status is not OK or if the API returns a failure response.
 */
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
    const parsedValue: { apiResponse: MappedDomain[T] } = parser.parse(xmlData);
    const json: NamecheapXMLParsedBase = simplifyObject(parsedValue.apiResponse);

    if(checkRequestError(json)){
        const error = (json as NamecheapXMLParsedFail).errors;
        throw {
            code: error.number,
            message: error.value
        }
    }

    return json as NamecheapXMLParsedSuccess<MappedDomain[T]>
}