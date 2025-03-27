import {NamecheapResponse} from "../types/response.type";

export const transformNumber = (value?: unknown): unknown | number => !value || isNaN(+value) ? value : +value;

export const transformBoolean = (value?: unknown): unknown | boolean => {
    if (typeof value === "string") {
        const valueLowerCase = value.toLowerCase();
        if (valueLowerCase === 'true' || valueLowerCase === "false") {
            return valueLowerCase === "true";
        }
    }

    return value;
};

export const removeUndefinedKeys = <T = NamecheapResponse>(obj: NamecheapResponse): T => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    return Object.fromEntries(
        Object.entries(obj)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, removeUndefinedKeys(value)])
    ) as T;
};