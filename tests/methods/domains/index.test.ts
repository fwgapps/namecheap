import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommandsDomain } from "../../../src/utils/commands";
import * as service from "../../../src/utils/service";
import type { NamecheapProps } from "../../../src/types/config.type";
import { NamecheapXMLParsedSuccess } from "../../../src/types/methods/base.type";
import { DomainListType, LockAction } from "../../../src/types/enum";
import { Domains } from "../../../src/methods/domains";
import {
  CheckSuccess,
  CreateSuccess,
  GetContactSuccess,
  GetInfoSuccess,
  GetListSuccess,
  GetRegistrarLockSuccess,
  GetTldListSuccess,
  ReactiveSuccess,
  RenewSuccess,
  SetContactSuccess,
  SetRegistrarLockSuccess,
} from "../../../src/types/methods/response/domains.type";

const mockConfig = {
  apiUser: "testuser",
  apiKey: "testkey",
  clientIp: "127.0.0.1",
  username: "testuser",
} as NamecheapProps;

describe("Domains", () => {
  let domains: Domains;

  beforeEach(() => {
    domains = new Domains(mockConfig);
    vi.resetAllMocks();
  });

  it("should return domain list by getList", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<GetListSuccess> = {
      requestedCommand: "namecheap.domains.getList",
      commandResponse: {
        domainGetListResult: [
          {
            id: 127,
            name: "domain1.com",
            user: "owner",
            created: "02/15/2016",
            expires: "02/15/2022",
            isExpired: false,
            isLocked: false,
            autoRenew: false,
            whoisGuard: "ENABLED",
            isPremium: true,
            isOurDns: true,
          },
          {
            id: 381,
            name: "domain2.com",
            user: "owner",
            created: "04/28/2016",
            expires: "04/28/2023",
            isExpired: false,
            isLocked: false,
            autoRenew: true,
            whoisGuard: "NOTPRESENT",
            isPremium: false,
            isOurDns: true,
          },
          {
            id: 385,
            name: "domain3.com",
            user: "owner",
            created: "05/22/2016",
            expires: "05/22/2023",
            isExpired: false,
            isLocked: false,
            autoRenew: true,
            whoisGuard: "ENABLED",
            isPremium: false,
            isOurDns: false,
          },
        ],
        paging: {
          totalItems: 2,
          currentPage: 1,
          pageSize: 10,
          paging: true,
        },
        type: "namecheap.domains.getList",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: 5,
      executionTime: 0.078,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await domains.getList({
      listType: DomainListType.All,
      page: 1,
      pageSize: 20,
    });

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.GetList, {
      listType: DomainListType.All,
      page: 1,
      pageSize: 20,
    });
    expect(result).toEqual({
      data: mockResponse.commandResponse.domainGetListResult,
      paging: mockResponse.commandResponse.paging,
    });
  });

  it("should return list of contacts by getContacts", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<GetContactSuccess> = {
      requestedCommand: "namecheap.domains.getContacts",
      commandResponse: {
        domainContactsResult: {
          registrant: {
            organizationName: "NameCheap.com",
            jobTitle: "Software Developer",
            firstName: "John",
            lastName: "Smith",
            address1: "8939 S. cross Blvd",
            address2: "ca 110-708",
            city: "california",
            stateProvince: "ca",
            stateProvinceChoice: "P",
            postalCode: 90045,
            country: "US",
            phone: 1.6613102107,
            fax: 1.6613102107,
            emailAddress: "john@gmail.com",
            phoneExt: 1.6613102,
            readOnly: false,
          },
          tech: {
            organizationName: "NameCheap.com",
            jobTitle: "Software Developer",
            firstName: "John",
            lastName: "Smith",
            address1: "8939 S. cross Blvd",
            address2: "ca 110-708",
            city: "california",
            stateProvince: "ca",
            stateProvinceChoice: "P",
            postalCode: 90045,
            country: "US",
            phone: 1.6613102107,
            fax: 1.6613102107,
            emailAddress: "john@gmail.com",
            phoneExt: 1.6613102,
            readOnly: false,
          },
          admin: {
            organizationName: "NameCheap.com",
            jobTitle: "Software Developer",
            firstName: "John",
            lastName: "Smith",
            address1: "8939 S. cross Blvd",
            address2: "ca 110-708",
            city: "california",
            stateProvince: "ca",
            stateProvinceChoice: "P",
            postalCode: 90045,
            country: "US",
            phone: 1.6613102107,
            fax: 1.6613102107,
            emailAddress: "john@gmail.com",
            phoneExt: 1.6613102,
            readOnly: false,
          },
          auxBilling: {
            organizationName: "NameCheap.com",
            jobTitle: "Software Developer",
            firstName: "John",
            lastName: "Smith",
            address1: "8939 S. cross Blvd",
            address2: "ca 110-708",
            city: "california",
            stateProvince: "ca",
            stateProvinceChoice: "P",
            postalCode: 90045,
            country: "US",
            phone: 1.6613102107,
            fax: 1.6613102107,
            emailAddress: "john@gmail.com",
            phoneExt: 1.6613102,
            readOnly: false,
          },
          currentAttributes: {
            registrantNexus: "C11",
            registrantPurpose: "P1",
          },
          whoisGuardContact: {
            registrant: {
              organizationName: "Privacy service provided by Withheld for Privacy ehf",
              jobTitle: "N/A",
              firstName: "Withheld for",
              lastName: "Privacy Purposes",
              address1: "Kalkofnsvegur 2",
              city: "Reykjavik",
              stateProvince: "Capital Region",
              stateProvinceChoice: "Capital Region",
              postalCode: 101,
              country: "IS",
              phone: 354.4212434,
              emailAddress: "95fabfd2c51b4307bsdfb626568.protect@withheldforprivacy.com",
              readOnly: true,
            },
            tech: {
              organizationName: "Privacy service provided by Withheld for Privacy ehf",
              jobTitle: "N/A",
              firstName: "Withheld for",
              lastName: "Privacy Purposes",
              address1: "Kalkofnsvegur 2",
              city: "Reykjavik",
              stateProvince: "Capital Region",
              stateProvinceChoice: "Capital Region",
              postalCode: 101,
              country: "IS",
              phone: 354.4212434,
              emailAddress: "95fabfd2c51b4307bsdfb626568.protect@withheldforprivacy.com",
              readOnly: true,
            },
            admin: {
              organizationName: "Privacy service provided by Withheld for Privacy ehf",
              jobTitle: "N/A",
              firstName: "Withheld for",
              lastName: "Privacy Purposes",
              address1: "Kalkofnsvegur 2",
              city: "Reykjavik",
              stateProvince: "Capital Region",
              stateProvinceChoice: "Capital Region",
              postalCode: 101,
              country: "IS",
              phone: 354.4212434,
              emailAddress: "95fabfd2c51b4307bsdfb626568.protect@withheldforprivacy.com",
              readOnly: true,
            },
            auxBilling: {
              organizationName: "Privacy service provided by Withheld for Privacy ehf",
              jobTitle: "N/A",
              firstName: "Withheld for",
              lastName: "Privacy Purposes",
              address1: "Kalkofnsvegur 2",
              city: "Reykjavik",
              stateProvince: "Capital Region",
              stateProvinceChoice: "Capital Region",
              postalCode: 101,
              country: "IS",
              phone: 354.4212434,
              emailAddress: "95fabfd2c51b4307bsdfb626568.protect@withheldforprivacy.com",
              readOnly: true,
            },
            whoisGuardContact: true,
          },
          domain: "domain1.com",
          domainnameid: 3152456,
        },
        type: "namecheap.domains.getContacts",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: 5,
      executionTime: 0.078,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await domains.getContacts("test.com");

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.GetContact, {
      domainName: "test.com",
    });
    expect(result).toEqual(mockResponse.commandResponse.domainContactsResult);
  });

  it("should return domain created by create", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<CreateSuccess> = {
      warnings: { warnings: true },
      requestedCommand: "namecheap.domains.create",
      commandResponse: {
        domainCreateResult: {
          domain: "aa.us.com",
          registered: true,
          chargedAmount: 200.87,
          domainId: 103877,
          orderId: 22158,
          transactionId: 51284,
          whoisguardEnable: false,
          nonRealTimeDomain: false,
        },
        type: "namecheap.domains.create",
      },
      server: "NC-DEV07",
      gmtTimeDifference: "+2:59",
      executionTime: 29.914,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const params = {
      years: 1,
      auxBilling: {
        firstName: "John",
        lastName: "Smith",
        address1: "8939 S.cross Blv",
        stateProvince: "CA",
        postalCode: "90045",
        country: "US",
        phone: "+1.6613102107",
        emailAddress: "john@gmail.com",
        organizationName: "NC",
        city: "CA",
      },
      tech: {
        firstName: "John",
        lastName: "Smith",
        address1: "8939 S.cross Blv",
        stateProvince: "CA",
        postalCode: "90045",
        country: "US",
        phone: "+1.6613102107",
        emailAddress: "john@gmail.com",
        organizationName: "NC",
        city: "CA",
      },
      admin: {
        firstName: "John",
        lastName: "Smith",
        address1: "8939 S.cross Blv",
        stateProvince: "CA",
        postalCode: "90045",
        country: "US",
        phone: "+1.6613102107",
        emailAddress: "john@gmail.com",
        organizationName: "NC",
        city: "CA",
      },
      registrant: {
        firstName: "John",
        lastName: "Smith",
        address1: "8939 S.cross Blv",
        stateProvince: "CA",
        postalCode: "90045",
        country: "US",
        phone: "+1.6613102107",
        emailAddress: "john@gmail.com",
        organizationName: "NC",
        city: "CA",
      },
      addFreeWhoisguard: "no",
      WGEnabled: "no",
      isPremiumDomain: false,
      premiumPrice: 206.7,
      eapFee: 0,
    };

    const result = await domains.create("aa.us.com", params);

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.Create, {
      domainName: "aa.us.com",
      ...params,
    });
    expect(result).toEqual(mockResponse.commandResponse.domainCreateResult);
  });

  it("should return tld list by getTldList", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<GetTldListSuccess> = {
      requestedCommand: "namecheap.domains.getTldList",
      commandResponse: {
        tlds: [
          {
            value: "US Business",
            name: "biz",
            nonRealTime: false,
            minRegisterYears: 1,
            maxRegisterYears: 10,
            minRenewYears: 1,
            maxRenewYears: 10,
            minTransferYears: 1,
            maxTransferYears: 10,
            isApiRegisterable: true,
            isApiRenewable: true,
            isApiTransferable: false,
            isEppRequired: false,
            isDisableModContact: false,
            isDisableWgAllot: false,
            isIncludeInExtendedSearchOnly: false,
            sequenceNumber: 5,
            type: "GTLD",
            isSupportsIdn: false,
            category: "P",
          },
          {
            value: "BZ Country Domain",
            name: "bz",
            nonRealTime: false,
            minRegisterYears: 1,
            maxRegisterYears: 10,
            minRenewYears: 1,
            maxRenewYears: 10,
            minTransferYears: 1,
            maxTransferYears: 10,
            isApiRegisterable: false,
            isApiRenewable: false,
            isApiTransferable: false,
            isEppRequired: false,
            isDisableModContact: false,
            isDisableWgAllot: false,
            isIncludeInExtendedSearchOnly: true,
            sequenceNumber: 11,
            type: "CCTLD",
            isSupportsIdn: false,
            category: "A",
          },
          {
            value: "Canada Country TLD",
            name: "ca",
            nonRealTime: true,
            minRegisterYears: 1,
            maxRegisterYears: 10,
            minRenewYears: 1,
            maxRenewYears: 10,
            minTransferYears: 1,
            maxTransferYears: 10,
            isApiRegisterable: false,
            isApiRenewable: false,
            isApiTransferable: false,
            isEppRequired: false,
            isDisableModContact: false,
            isDisableWgAllot: false,
            isIncludeInExtendedSearchOnly: true,
            sequenceNumber: 7,
            type: "CCTLD",
            isSupportsIdn: false,
            category: "A",
          },
          {
            value: "CC TLD",
            name: "cc",
            nonRealTime: false,
            minRegisterYears: 1,
            maxRegisterYears: 10,
            minRenewYears: 1,
            maxRenewYears: 10,
            minTransferYears: 1,
            maxTransferYears: 10,
            isApiRegisterable: false,
            isApiRenewable: false,
            isApiTransferable: false,
            isEppRequired: false,
            isDisableModContact: false,
            isDisableWgAllot: false,
            isIncludeInExtendedSearchOnly: true,
            sequenceNumber: 9,
            type: "CCTLD",
            isSupportsIdn: false,
            category: "A",
          },
          {
            value: "UK based domain",
            name: "co.uk",
            nonRealTime: false,
            minRegisterYears: 2,
            maxRegisterYears: 10,
            minRenewYears: 2,
            maxRenewYears: 10,
            minTransferYears: 2,
            maxTransferYears: 10,
            isApiRegisterable: true,
            isApiRenewable: false,
            isApiTransferable: false,
            isEppRequired: false,
            isDisableModContact: false,
            isDisableWgAllot: false,
            isIncludeInExtendedSearchOnly: false,
            sequenceNumber: 18,
            type: "CCTLD",
            isSupportsIdn: false,
            category: "A",
          },
        ],
        type: "namecheap.domains.getTldList",
      },
      server: "IMWS-A06",
      gmtTimeDifference: "+5:30",
      executionTime: 0.047,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await domains.getTldList();

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.GetTldList);
    expect(result).toEqual(mockResponse.commandResponse.tlds);
  });

  it("should return contact created by setContacts", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<SetContactSuccess> = {
      requestedCommand: "namecheap.domains.setContacts",
      commandResponse: {
        domainSetContactResult: "domain1.com",
        type: "namecheap.domains.setContacts",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: 5,
      executionTime: 0.078,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);
    const params = {
      auxBilling: {
        firstName: "Daisy",
        lastName: "Smith",
        address1: "8939 S.cross Blvd",
        city: "california",
        organizationName: "Org1",
        stateProvince: "CA",
        postalCode: 90045,
        country: "US",
        phone: "+1.6613102107",
        emailAddress: "john@gmail.com",
      },
      tech: {
        firstName: "Daisy",
        lastName: "Smith",
        address1: "8939 S.cross Blvd",
        city: "california",
        organizationName: "Org1",
        stateProvince: "CA",
        postalCode: 90045,
        country: "US",
        phone: "+1.6613102107",
        emailAddress: "john@gmail.com",
      },
      admin: {
        firstName: "Daisy",
        lastName: "Smith",
        address1: "8939 S.cross Blvd",
        city: "california",
        organizationName: "Org1",
        stateProvince: "CA",
        postalCode: 90045,
        country: "US",
        phone: "+1.6613102107",
        emailAddress: "john@gmail.com",
      },
      registrant: {
        firstName: "Daisy",
        lastName: "Smith",
        address1: "8939 S.cross Blvd",
        city: "california",
        organizationName: "Org1",
        stateProvince: "CA",
        postalCode: 90045,
        country: "US",
        phone: "+1.6613102107",
        emailAddress: "john@gmail.com",
      },
    };

    const result = await domains.setContacts("domain1.com", params);

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.SetContact, {
      ...params,
      domainName: "domain1.com",
    });
    expect(result).toEqual(mockResponse.commandResponse.domainSetContactResult);
  });

  it("should return domain availability status by check", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<CheckSuccess> = {
      warnings: { warnings: true },
      requestedCommand: "namecheap.domains.check",
      commandResponse: {
        domainCheckResult: [
          {
            domain: "testapi.xyz",
            available: false,
            errorNo: 0,
            isPremiumName: false,
            premiumRegistrationPrice: 0,
            premiumRenewalPrice: 0,
            premiumRestorePrice: 0,
            premiumTransferPrice: 0,
            icannFee: 0,
            eapFee: 0,
          },
        ],
        type: "namecheap.domains.check",
      },
      server: "PHX01APIEXT02",
      gmtTimeDifference: "--4:00",
      executionTime: 1.358,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await domains.check(["us.xyz"]);

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.Check, {
      domainList: "us.xyz",
    });
    expect(result).toEqual(mockResponse.commandResponse.domainCheckResult);
  });

  it("should return domain reactivate info by reactivate", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<ReactiveSuccess> = {
      requestedCommand: "namecheap.domains.reactivate",
      commandResponse: {
        domainReactivateResult: {
          domain: "models.tv",
          isSuccess: true,
          chargedAmount: 650,
          orderId: 23569,
          transactionId: 25080,
        },
        type: "namecheap.domains.reactivate",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: "+5:00",
      executionTime: 12.915,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const params = {
      yearsToAdd: 1,
      isPremiumDomain: true,
      premiumPrice: 650,
    };

    const result = await domains.reactivate("models.tv", params);

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.Reactivate, {
      ...params,
      domainName: "models.tv",
    });

    expect(result).toEqual(mockResponse.commandResponse.domainReactivateResult);
  });

  it("should return domain renew info by renew", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<RenewSuccess> = {
      requestedCommand: "namecheap.domains.renew",
      commandResponse: {
        domainRenewResult: {
          domainDetails: {
            expiredDate: "4/30/2021 11:31:13 AM",
            numYears: 0,
            domainDetails: true,
          },
          domainName: "models.tv",
          domainId: 151378,
          renew: true,
          orderId: 109116,
          transactionId: 119569,
          chargedAmount: 650,
        },
        type: "namecheap.domains.renew",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: "+2:59",
      executionTime: 29.914,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const params = {
      years: 1,
      isPremiumDomain: true,
      premiumPrice: 650,
    };

    const result = await domains.renew("models.tv", params);

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.Renew, {
      ...params,
      domainName: "models.tv",
    });

    expect(result).toEqual(mockResponse.commandResponse.domainRenewResult);
  });

  it("should return registrar lock of domain by getRegistrarLock", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<GetRegistrarLockSuccess> = {
      requestedCommand: "namecheap.domains.getRegistrarLock",
      commandResponse: {
        domainGetRegistrarLockResult: { domain: "domain1.com", registrarLockStatus: false },
        type: "namecheap.domains.getRegistrarLock",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: "+5:30",
      executionTime: 2.812,
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await domains.getRegistrarLock("domain1.com");

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.GetRegistrarLock, {
      domainName: "domain1.com",
    });

    expect(result).toEqual(mockResponse.commandResponse.domainGetRegistrarLockResult);
  });

  it("should return registrar lock of set by setRegistrarLock", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<SetRegistrarLockSuccess> = {
      requestedCommand: "namecheap.domains.setRegistrarLock",
      commandResponse: {
        domainSetRegistrarLockResult: "domain1.com",
        type: "namecheap.domains.setRegistrarLock",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: "+5:30",
      executionTime: 1.422,
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await domains.setRegistrarLock("domain1.com", LockAction.Unlock);

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.SetRegistrarLock, {
      domainName: "domain1.com",
      lockAction: LockAction.Unlock,
    });

    expect(result).toEqual(mockResponse.commandResponse.domainSetRegistrarLockResult);
  });

  it("should return information about the requested domain by getInfo", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<GetInfoSuccess> = {
      requestedCommand: "namecheap.domains.getinfo",
      commandResponse: {
        domainGetInfoResult: {
          domainDetails: {
            createdDate: "09/05/2016",
            expiredDate: "09/05/2016",
            domainDetails: true,
          },
          whoisguard: { id: 3655801, expiredDate: "01/26/2013", enabled: "True" },
          dnsDetails: { providerType: "ENOM" },
          modificationrights: { all: true },
          status: "Ok",
          id: 736542,
          domainName: "domain1.com",
          ownerName: "apisuer",
          isOwner: true,
          isPremium: true,
        },
        type: "namecheap.domains.getinfo",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: "+5:30",
      executionTime: 9.328,
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await domains.getInfo("domain1.com");

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomain.GetInfo, {
      domainName: "domain1.com",
    });

    expect(result).toEqual(mockResponse.commandResponse.domainGetInfoResult);
  });
});
