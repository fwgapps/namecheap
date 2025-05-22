import { XMLParser } from "fast-xml-parser";
import { camelCase, pascalCase } from "change-case-all";
import { simplifyObject } from "./xml";
import type { NamecheapProps } from "../types/config.type";
import {
  NamecheapXMLParsedBase,
  NamecheapXMLParsedFail,
  NamecheapXMLParsedSuccess,
  RequestValues,
} from "../types/methods/base.type";
import {
  MappedResponseSuccess,
  NamecheapParamsMap,
  NamecheapPostParamsMap,
  NamecheapRootParamsMap,
} from "../types/methods/mapped.type";

export const getNamecheapHost = (isSandbox: boolean): string => {
  const host = !isSandbox ? "api.namecheap.com" : "api.sandbox.namecheap.com";
  return `https://${host}/xml.response`;
};

const checkRequestError = (response: NamecheapXMLParsedBase | NamecheapXMLParsedFail): boolean =>
  response.status === "ERROR" || Object.hasOwnProperty.call(response, "errors");

/* eslint-disable */
const flattenObjectToArray = (
  input: Record<string, any>,
  prefix: string = "",
  arrayFormat = true,
): Array<[string, string]> => {
  const result: Array<[string, string]> = [];

  Object.entries(input).forEach(([key, value]) => {
    const capitalizedKey = pascalCase(`${prefix} ${key}`);

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result.push(...flattenObjectToArray(value, capitalizedKey));
    } else if (typeof value === "object" && value !== null && Array.isArray(value)) {
      value.forEach((item, index) => {
        if (arrayFormat) {
          result.push([`${capitalizedKey}[${index + 1}]`, String(item)]);
        } else {
          result.push([`${capitalizedKey}${index + 1}`, String(item)]);
        }
      });
    } else if (value !== undefined && value !== null) {
      result.push([capitalizedKey, String(value)]);
    }
  });

  return result;
};

const tagNamesArray = [
  "apiResponse.commandResponse.tlds.tld",
  "apiResponse.commandResponse.tlds.tld.categories",
  "apiResponse.commandResponse.domainGetListResult.domain",
  "apiResponse.commandResponse.domainCheckResult",
  "apiResponse.commandResponse.userGetPricingResult.productType.productCategory",
  "apiResponse.commandResponse.userGetPricingResult.productType.productCategory.product",
  "apiResponse.commandResponse.userGetPricingResult.productType.productCategory.product.price",
  "apiResponse.commandResponse.whoisguardGetListResult.whoisguardGetListResult.whoisguard",
  "apiResponse.commandResponse.domainDnsGetEmailForwardingResult.forward",
  "apiResponse.commandResponse.domainDnsSetHostsResult",
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

export async function request<T extends keyof MappedResponseSuccess>(
  namecheapProps: NamecheapProps,
  command: T,
  params: NamecheapParamsMap[T] = {} as NamecheapParamsMap[T],
): Promise<NamecheapXMLParsedSuccess<MappedResponseSuccess[T]>> {
  const { apiUser, apiKey, apiUrl, username, clientIp } = namecheapProps;

  let url = new URL(apiUrl);
  url.searchParams.append("ApiUser", apiUser);
  url.searchParams.append("ApiKey", apiKey);
  url.searchParams.append("UserName", username);
  url.searchParams.append("ClientIp", clientIp);
  url.searchParams.append("Command", command);

  flattenObjectToArray(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Error in API Namecheap: ${response.statusText}`);
  }

  const xmlData = await response.text();

  // await response.text();
  const parsedValue: { apiResponse: MappedResponseSuccess[T] } = parser.parse(xmlData);
  const json: NamecheapXMLParsedBase = simplifyObject(parsedValue.apiResponse);

  if (checkRequestError(json)) {
    const error = (json as NamecheapXMLParsedFail).errors;
    throw {
      code: error.number || -1,
      message: error.value || "Unknown Error",
    };
  }

  return json as NamecheapXMLParsedSuccess<MappedResponseSuccess[T]>;
}

export async function requestPost<T extends keyof MappedResponseSuccess>(
  namecheapProps: NamecheapProps,
  command: T,
  rootParams: NamecheapRootParamsMap[T] = {} as NamecheapRootParamsMap[T],
  params: NamecheapPostParamsMap[T] = {} as NamecheapPostParamsMap[T],
): Promise<NamecheapXMLParsedSuccess<MappedResponseSuccess[T]>> {
  const { apiUser, apiKey, apiUrl, username, clientIp } = namecheapProps;

  let url = new URL(apiUrl);
  url.searchParams.append("ApiUser", apiUser);
  url.searchParams.append("ApiKey", apiKey);
  url.searchParams.append("UserName", username);
  url.searchParams.append("ClientIp", clientIp);
  url.searchParams.append("Command", command);

  const requestValues: Array<RequestValues> = [];

  flattenObjectToArray(rootParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  flattenObjectToArray(params, "", false).forEach(([key, value]) => {
    requestValues.push({
      Key: key,
      Value: value,
    });
  });

  const body = {
    request: {
      RequestValues: requestValues,
    },
  };

  const response = await fetch(url.toString(), {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Error in API Namecheap: ${response.statusText}`);
  }

  const xmlData = await response.text();
  const parsedValue: { apiResponse: MappedResponseSuccess[T] } = parser.parse(xmlData);
  const json: NamecheapXMLParsedBase = simplifyObject(parsedValue.apiResponse);

  if (checkRequestError(json)) {
    const error = (json as NamecheapXMLParsedFail).errors;
    throw {
      code: error.number,
      message: error.value,
    };
  }

  return json as NamecheapXMLParsedSuccess<MappedResponseSuccess[T]>;
}
