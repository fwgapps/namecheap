import {simplifyObject} from './xml';

describe('simplifyObject', () => {
    test('simplifies an array by removing null, undefined, or empty string values', () => {
        const input = [null, undefined, '', 'text', 42, {}];
        const output = simplifyObject(input);
        expect(output).toEqual(['text', 42, {}]);
    });

    test('returns the value of "#text" if object contains exactly two keys with one boolean "true"', () => {
        const input = {"#text": "example", isTrue: true};
        const output = simplifyObject(input);
        expect(output).toBe("example");
    });

    test('simplifies the value of the non-boolean key if object contains exactly two keys with one boolean "true"', () => {
        const input = {key: {nestedKey: 'value'}, isValid: true};
        const output = simplifyObject(input);
        expect(output).toEqual({nestedKey: 'value'});
    });

    test('renames "#text" to "value" and simplifies nested properties in a general object', () => {
        const input = {
            "#text": "example",
            nested: {
                "#text": "nestedExample",
                empty: "",
                nullValue: null
            }
        };
        const output = simplifyObject(input);
        expect(output).toEqual({
            value: "example",
            nested: {
                value: "nestedExample"
            }
        });
    });

    test('returns primitives as-is for non-objects and non-arrays', () => {
        expect(simplifyObject('string')).toBe('string');
        expect(simplifyObject(123)).toBe(123);
        expect(simplifyObject(true)).toBe(true);
    });
});