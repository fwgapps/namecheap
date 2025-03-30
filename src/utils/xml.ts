/**
 * Simplifies a complex object by recursively processing its structure.
 * This function performs the following transformations:
 * - For arrays, it simplifies each element and filters out null, undefined, or empty string values.
 * - For objects with specific keys and conditions:
 *   - If the object contains exactly two keys, one named `"#text"` and another key with a boolean value of `true`,
 *     the function extracts and returns the value of the `"#text"` key.
 *   - If the object contains exactly two keys, with one key holding a boolean value of `true`,
 *     the function simplifies the value associated with the other key.
 * - For general objects, it renames the `"#text"` key to `value` and simplifies all properties recursively.
 *   Null, undefined, and empty string properties are excluded from the resulting object.
 * - For other types (primitive values), the value is returned as-is.
 *
 * @param {any} obj - The object or value to simplify.
 * @returns {any} - The simplified object or value.
 */
export const simplifyObject = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj
            .map(simplifyObject)
            .filter(item => item !== null && item !== undefined && item !== "");
    } else if (typeof obj === "object" && obj !== null) {
        const keys = Object.keys(obj);

        if (
            keys.length === 2 &&
            keys.includes("#text") &&
            keys.some(key => key !== "#text" && obj[key] === true)
        ) {
            return obj["#text"];
        }

        if (
            keys.length === 2 &&
            keys.some(key => obj[key] === true)
        ) {
            const keyWithValue = keys.find(key => obj[key] !== true);
            return simplifyObject(obj[keyWithValue!]);
        }

        return Object.keys(obj).reduce((acc, key) => {
            const newKey = key === "#text" ? "value" : key;
            const simplifiedValue = simplifyObject(obj[key]);

            if (simplifiedValue !== null && simplifiedValue !== undefined && simplifiedValue !== "") {
                acc[newKey] = simplifiedValue;
            }

            return acc;
        }, {} as Record<string, any>);
    }

    return obj;
};
