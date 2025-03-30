import type { NamecheapProps } from "@fwg/types/config.type";
import {ListType, LockAction} from "@fwg/types/methods/params.type";
import {Domains} from './index';

jest.mock('./index', () => {
    const originalModule = jest.requireActual('./index');
    return {
        ...originalModule,
        request: jest.fn(),
    };
});

const requestMock = require('./index').request;

const mockConfig: NamecheapProps = {
    apiUser: 'mockUser',
    apiKey: 'mockApiKey',
    clientIp: '127.0.0.1',
    apiUrl: 'https://mockapi.namecheap.com',
    username: 'mockUsername',
};

describe('Domains', () => {
    let domains: Domains;

    beforeEach(() => {
        domains = new Domains(mockConfig);
        jest.clearAllMocks();
    });

    test('should retrieve domain list using getList()', async () => {
        const mockResponse = {
            domainGetListResult: [],
            paging: {totalEntries: 0, currentPage: 1, totalPages: 1},
        };
        requestMock.mockResolvedValueOnce(mockResponse);

        const params = {listType: 'ALL' as ListType, page: 1, pageSize: 20};
        const result = await domains.getList(params);

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.getList', params);
        expect(result).toEqual(mockResponse);
    });

    test('should retrieve contacts for a domain using getContacts()', async () => {
        const mockResponse = {
            domainContactsResult: {
                currentAttributes: {},
                whoisGuardContact: {whoisGuardContact: true},
                domain: 'example.com',
                domainnameid: 12345,
            },
        };
        requestMock.mockResolvedValueOnce(mockResponse);

        const result = await domains.getContacts('example.com');

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.getContacts', {domainName: 'example.com'});
        expect(result).toEqual(mockResponse);
    });

    test('should create a new domain using create()', async () => {
        const mockResponse = {
            domain: 'example.com',
            registered: true,
            chargedAmount: 10.00,
            domainID: 123,
            orderID: 456,
            transactionID: 789,
            whoisguardEnable: true,
            nonRealTimeDomain: false,
        };

        const params = {
            years: 1,
            extendedAttributes: '',
            nameservers: 'ns1.example.com',
            registrant: {
                organizationName: 'RegistrantOrg',
                jobTitle: 'Owner',
                firstName: 'John',
                lastName: 'Doe',
                address1: '123 Mock Street',
                address2: 'Suite 5',
                city: 'MockCity',
                stateProvince: 'MockState',
                stateProvinceChoice: 'State',
                postalCode: 12345,
                country: 'US',
                phone: 1234567890,
                fax: 987654321,
                emailAddress: 'john.doe@example.com',
                phoneExt: 101,
                readOnly: false,
            },
            tech: {
                organizationName: 'TechOrg',
                jobTitle: 'Tech Manager',
                firstName: 'Jane',
                lastName: 'Doe',
                address1: '456 Tech Avenue',
                address2: 'Apt 7',
                city: 'TechCity',
                stateProvince: 'TechState',
                stateProvinceChoice: 'State',
                postalCode: 54321,
                country: 'US',
                phone: 9876543210,
                fax: 123456789,
                emailAddress: 'jane.doe@example.com',
                phoneExt: 102,
                readOnly: false,
            },
            admin: {
                organizationName: 'AdminOrg',
                jobTitle: 'Admin Manager',
                firstName: 'Alice',
                lastName: 'Smith',
                address1: '789 Admin Boulevard',
                address2: '',
                city: 'AdminCity',
                stateProvince: 'AdminState',
                stateProvinceChoice: 'State',
                postalCode: 67890,
                country: 'US',
                phone: 1112223333,
                fax: 0,
                emailAddress: 'alice.smith@example.com',
                phoneExt: 103,
                readOnly: false,
            },
            auxBilling: {
                organizationName: 'BillingOrg',
                jobTitle: 'Billing Manager',
                firstName: 'Bob',
                lastName: 'Brown',
                address1: '321 Billing Road',
                address2: '',
                city: 'BillingCity',
                stateProvince: 'BillingState',
                stateProvinceChoice: 'State',
                postalCode: 43210,
                country: 'US',
                phone: 2223334444,
                fax: 0,
                emailAddress: 'bob.brown@example.com',
                phoneExt: 104,
                readOnly: false,
            },
        };

        requestMock.mockResolvedValueOnce(mockResponse);

        const result = await domains.create('example.com', params);

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.create', {
            ...params,
            domainName: 'example.com',
        });
        expect(result).toEqual(mockResponse);
    });

    test('should retrieve TLD list using getTldList()', async () => {
        const mockResponse = {tlds: []};
        requestMock.mockResolvedValueOnce(mockResponse);

        const result = await domains.getTldList();

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.getTldList');
        expect(result).toEqual(mockResponse);
    });

    test('should set contacts for a domain using setContacts()', async () => {
        const mockResponse = { domainSetContactResult: 'Success' };
        const params = {
            extendedAttributes: '',
            registrant: {
                organizationName: 'TestOrg',
                jobTitle: 'Tester',
                firstName: 'John',
                lastName: 'Doe',
                address1: '123 Street',
                address2: 'Apt 4B',
                city: 'New York',
                stateProvince: 'NY',
                stateProvinceChoice: 'State',
                postalCode: 10001,
                country: 'US',
                phone: 1234567890,
                fax: 1234567891,
                emailAddress: 'john.doe@example.com',
                phoneExt: 12,
                readOnly: false
            },
            tech: {
                organizationName: 'TechOrg',
                jobTitle: 'TechSupport',
                firstName: 'Jane',
                lastName: 'Smith',
                address1: '456 Avenue',
                address2: '',
                city: 'Los Angeles',
                stateProvince: 'CA',
                stateProvinceChoice: 'State',
                postalCode: 90001,
                country: 'US',
                phone: 9876543210,
                fax: 0,
                emailAddress: 'jane.smith@example.com',
                phoneExt: 34,
                readOnly: false
            },
            admin: {
                organizationName: 'AdminCo',
                jobTitle: 'Administrator',
                firstName: 'Alice',
                lastName: 'Johnson',
                address1: '789 Boulevard',
                address2: '',
                city: 'Chicago',
                stateProvince: 'IL',
                stateProvinceChoice: 'State',
                postalCode: 60007,
                country: 'US',
                phone: 1112223333,
                fax: 0,
                emailAddress: 'alice.johnson@example.com',
                phoneExt: 56,
                readOnly: false
            },
            auxBilling: {
                organizationName: 'BillingOrg',
                jobTitle: 'BillingManager',
                firstName: 'Bill',
                lastName: 'Pay',
                address1: '321 Road',
                address2: '',
                city: 'Houston',
                stateProvince: 'TX',
                stateProvinceChoice: 'State',
                postalCode: 77001,
                country: 'US',
                phone: 5556667777,
                fax: 0,
                emailAddress: 'bill.pay@example.com',
                phoneExt: 78,
                readOnly: false
            }
        };

        requestMock.mockResolvedValueOnce(mockResponse);

        const result = await domains.setContacts('example.com', params);

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.setContacts', {
            ...params,
            domainName: 'example.com',
        });
        expect(result).toEqual(mockResponse);
    });

    test('should check domain availability using check()', async () => {
        const mockResponse = {
            domainCheckResult: {
                domain: 'example.com',
                available: true,
                errorNo: 0,
                isPremiumName: false,
                premiumRegistrationPrice: 0,
            },
        };
        requestMock.mockResolvedValueOnce(mockResponse);

        const result = await domains.check(['example.com']);

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.check', {domainList: 'example.com'});
        expect(result).toEqual(mockResponse);
    });

    test('should reactivate a domain using reactivate()', async () => {
        const mockResponse = {
            domainReactivateResult: {
                domain: 'example.com',
                isSuccess: true,
                chargedAmount: 15,
                orderId: 1,
                transactionId: 123,
            },
        };
        requestMock.mockResolvedValueOnce(mockResponse);

        const result = await domains.reactivate('example.com', {});

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.reactivate', {
            domainName: 'example.com',
        });
        expect(result).toEqual(mockResponse);
    });

    test('should renew a domain using renew()', async () => {
        const mockResponse = {
            domainRenewResult: {
                domainName: 'example.com',
                domainId: 123,
                renew: true,
                transactionId: 456,
                chargedAmount: 12.34,
            },
        };
        const params = {years: 1};
        requestMock.mockResolvedValueOnce(mockResponse);

        const result = await domains.renew('example.com', params);

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.renew', {
            ...params,
            domainName: 'example.com',
        });
        expect(result).toEqual(mockResponse);
    });

    test('should retrieve registrar lock status using getRegistrarLock()', async () => {
        const mockResponse = {
            domainGetRegistrarLockResult: {domain: 'example.com', registrarLockStatus: true},
        };
        requestMock.mockResolvedValueOnce(mockResponse);

        const result = await domains.getRegistrarLock('example.com');

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.getRegistrarLock', {domainName: 'example.com'});
        expect(result).toEqual(mockResponse);
    });

    test('should set registrar lock status using setRegistrarLock()', async () => {
        const mockResponse = {
            domainSetRegistrarLockResult: {
                domain: 'example.com',
                isSuccess: true,
                registrarLockStatus: true,
            },
        };
        const params = {lockAction: 'LOCK' as LockAction};
        requestMock.mockResolvedValueOnce(mockResponse);

        const result = await domains.setRegistrarLock('example.com', params);

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.setRegistrarLock', {
            ...params,
            domainName: 'example.com',
        });
        expect(result).toEqual(mockResponse);
    });

    test('should retrieve domain information using getInfo()', async () => {
        const mockResponse = {domainGetInfoResult: {domainName: 'example.com', status: 'active'}};
        requestMock.mockResolvedValueOnce(mockResponse);

        const result = await domains.getInfo('example.com', {});

        expect(requestMock).toHaveBeenCalledWith(mockConfig, 'namecheap.domains.getInfo', {
            domainName: 'example.com',
        });
        expect(result).toEqual(mockResponse);
    });
});