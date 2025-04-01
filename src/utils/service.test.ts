import {getNamecheapHost, request} from './service';
import {CommandsDomain} from "@fwg/utils/commands";

describe('getNamecheapHost', () => {
    it('should return the production URL when isSandbox is false', () => {
        const result = getNamecheapHost(false);
        expect(result).toBe('https://api.namecheap.com/xml.response');
    });

    it('should return the sandbox URL when isSandbox is true', () => {
        const result = getNamecheapHost(true);
        expect(result).toBe('https://api.sandbox.namecheap.com/xml.response');
    });
});

describe('request', () => {
    const mockProps = {
        apiUser: "mockApiUser",
        apiKey: "mockApiKey",
        clientIp: "mockClientIp",
        apiUrl: "https://api.mock.namecheap.com/xml.response",
        username: "mockUsername",
    };

    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    beforeEach(() => {
        mockFetch.mockClear()
    });

    it('should successfully parse XML response and return JSON data', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            text: jest.fn().mockResolvedValue('<apiResponse><status>OK</status><commandResponse>Success</commandResponse></apiResponse>'),
        });

        const result = await request(mockProps, CommandsDomain.GetList, {});

        expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/https:\/\/api.mock.namecheap.com\/xml.response/));
        expect(result).toEqual({status: "OK", commandResponse: "Success"});
    });
});