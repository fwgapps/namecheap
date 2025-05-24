import { describe, it, expect, vi, beforeEach } from "vitest";
import { DomainsDNS } from "../../../src/methods/domains/dns";
import { CommandsDomainDNS } from "../../../src/utils/commands";
import * as service from "../../../src/utils/service";
import type { NamecheapProps } from "../../../src/types/config.type";
import {
  Host,
  SetDNSEmailForwardingParams,
  SetDNSHostsParams,
} from "../../../src/types/methods/params/domains-dns-params.type";
import { NamecheapXMLParsedSuccess } from "../../../src/types/methods/base.type";
import {
  GetDNSEmailForwardingSuccess,
  GetDNSHostsSuccess,
  GetDNSListSuccess,
  SetDNSCustomSuccess,
  SetDNSDefaultSuccess,
  SetDNSEmailForwardingSuccess,
  SetDNSHostsSuccess,
} from "../../../src/types/methods/response/domains-dns.type";
import { RecordType } from "../../../src/types/enum";

const mockConfig = {
  apiUser: "testuser",
  apiKey: "testkey",
  clientIp: "127.0.0.1",
  username: "testuser",
} as NamecheapProps;

describe("DomainsDNS", () => {
  let dns: DomainsDNS;

  beforeEach(() => {
    dns = new DomainsDNS(mockConfig);
    vi.resetAllMocks();
  });

  it("should return domain changed by setDefault", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<SetDNSDefaultSuccess> = {
      requestedCommand: "namecheap.domains.dns.setDefault",
      commandResponse: {
        domainDnsSetDefaultResult: "domain.com",
        type: "namecheap.domains.dns.setDefault",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: 5,
      executionTime: 32.76,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await dns.setDefault("example", "com");
    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomainDNS.SetDefault, {
      sld: "example",
      tld: "com",
    });
    expect(result).toBe(mockResponse.commandResponse.domainDnsSetDefaultResult);
  });

  it("should return domain changed by setCustom", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<SetDNSCustomSuccess> = {
      requestedCommand: "namecheap.domains.dns.setCustom",
      commandResponse: {
        domainDNSSetCustomResult: "domain.com",
        type: "namecheap.domains.dns.setCustom",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: 5,
      executionTime: 32.76,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const nameservers = ["ns1.example.com", "ns2.example.com"];
    const result = await dns.setCustom("example", "com", nameservers);
    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomainDNS.SetCustom, {
      sld: "example",
      tld: "com",
      nameservers,
    });
    expect(result).toBe(mockResponse.commandResponse.domainDNSSetCustomResult);
  });

  it("should return dns list by getList", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<GetDNSListSuccess> = {
      requestedCommand: "namecheap.domains.dns.getList",
      commandResponse: {
        domainDnsGetListResult: {
          nameserver: ["dns1.name-servers.com", "dns2.name-servers.com"],
          domain: "domain.com",
          isUsingOurDns: true,
        },
        type: "namecheap.domains.dns.getList",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: 5,
      executionTime: 32.76,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await dns.getList("example", "com");

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomainDNS.GetList, {
      sld: "example",
      tld: "com",
    });
    expect(result).toEqual(mockResponse.commandResponse.domainDnsGetListResult);
  });

  it("should return dns hosts by getHosts", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<GetDNSHostsSuccess> = {
      requestedCommand: "namecheap.domains.dns.getHosts",
      commandResponse: {
        domainDnsGetHostsResult: {
          host: [
            {
              hostId: 12,
              name: "@",
              type: "A",
              address: "1.2.3.4",
              mxPref: 10,
              ttl: 1800,
            },
            {
              hostId: 14,
              name: "www",
              type: "A",
              address: "122.23.3.7",
              mxPref: 10,
              ttl: 1800,
            },
          ],
          domain: "domain.com",
          isUsingOurDns: true,
        },
        type: "namecheap.domains.dns.getHosts",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: 5,
      executionTime: 32.76,
      xmlns: "http://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await dns.getHosts("example", "com");

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomainDNS.GetHosts, {
      sld: "example",
      tld: "com",
    });
    expect(result).toEqual(mockResponse.commandResponse.domainDnsGetHostsResult);
  });

  it("should return list of email forwarding by getEmailForwarding", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<GetDNSEmailForwardingSuccess> = {
      requestedCommand: "namecheap.domains.dns.getEmailForwarding",
      commandResponse: {
        domainDnsGetEmailForwardingResult: {
          forward: [
            {
              value: "name1@domain.com",
              mailbox: "name1",
            },
            {
              value: "name2@domain.com",
              mailbox: "name2",
            },
          ],
          domain: "domain.com",
        },
        type: "namecheap.domains.dns.getEmailForwarding",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: "--5:00",
      executionTime: 0.01,
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const result = await dns.getEmailForwarding("example.com");

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomainDNS.GetEmailForwarding, {
      domainName: "example.com",
    });
    expect(result).toEqual(mockResponse.commandResponse.domainDnsGetEmailForwardingResult);
  });

  it("should return domain affected by setEmailForwarding", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<SetDNSEmailForwardingSuccess> = {
      requestedCommand: "namecheap.domains.dns.setEmailForwarding",
      commandResponse: {
        domainDnsSetEmailForwardingResult: "domain.com",
        type: "namecheap.domains.dns.setEmailForwarding",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: "--5:00",
      executionTime: 0.13,
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const params: Omit<SetDNSEmailForwardingParams, "domainName"> = {
      forwardTo: ["forward@example.com"],
      mailBox: ["mailBox@example.com"],
    };

    const result = await dns.setEmailForwarding("example.com", params);

    expect(service.request).toHaveBeenCalledWith(mockConfig, CommandsDomainDNS.SetEmailForwarding, {
      ...params,
      domainName: "example.com",
    });
    expect(result).toBe(mockResponse.commandResponse.domainDnsSetEmailForwardingResult);
  });

  it("should get domain affected by setHosts and used POST method because have more than 10 Hosts", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<SetDNSHostsSuccess> = {
      requestedCommand: "namecheap.domains.dns.setHosts",
      commandResponse: {
        domainDnsSetHostsResult: ["domain51.com"],
        type: "namecheap.domains.dns.setHosts",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: 5,
      executionTime: 32.76,
      xmlns: "https://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "requestPost").mockResolvedValue(mockResponse);

    const hosts = [
      {
        hostname: "@",
        recordType: RecordType.A,
        address: "213.87.128.103",
        ttl: 3600,
      },
      {
        hostname: "@",
        recordType: RecordType.AAAA,
        address: "8f1f:6f14:ca8e:e50c:6a3a:7f30:2814:5d70",
        ttl: 300,
      },
      {
        hostname: "@",
        recordType: RecordType.CAA,
        address: '0 issue "iva.name"',
        ttl: 1800,
      },
      {
        hostname: "www",
        recordType: RecordType.CNAME,
        address: "chasity.biz.",
        ttl: 1200,
      },
      {
        hostname: "dk1024-2012._domainkey.returnpath.com.",
        recordType: RecordType.TXT,
        address: "Aut et sed sit quos aut harum omnis molestias asperiores.",
        ttl: 1200,
      },
      {
        hostname: "ns",
        recordType: RecordType.NS,
        address: "gabriel.info.",
        ttl: 3600,
      },
      {
        hostname: "mail",
        recordType: RecordType.MX,
        address: "mail.example.com.",
        ttl: 3600,
      },
      {
        hostname: "_dmarc",
        recordType: RecordType.TXT,
        address: "v=DMARC1; p=none; rua=mailto:dmarc@example.com",
        ttl: 1800,
      },
      {
        hostname: "api",
        recordType: RecordType.A,
        address: "192.0.2.123",
        ttl: 600,
      },
      {
        hostname: "_acme-challenge",
        recordType: RecordType.TXT,
        address: "1a2b3c4d5e6f7g8h9i",
        ttl: 300,
      },
      {
        hostname: "@",
        recordType: RecordType.A,
        address: "sip.example.com.",
        ttl: 7200,
      },
      {
        hostname: "ftp",
        recordType: RecordType.CNAME,
        address: "server.example.com.",
        ttl: 3600,
      },
    ];

    const params: Omit<
      SetDNSHostsParams,
      "sld" | "tld" | "address" | "hostname" | "mxpref" | "recordType" | "ttl"
    > & { hosts: Array<Host> } = {
      hosts,
    };

    const result = await dns.setHosts("example", "com", params);

    expect(service.requestPost).toHaveBeenCalled();
    expect(result).toBe(mockResponse.commandResponse.domainDnsSetHostsResult);
  });

  it("should get domain affected by setHosts and used GET method because have less or equal 10 Hosts", async () => {
    const mockResponse: NamecheapXMLParsedSuccess<SetDNSHostsSuccess> = {
      requestedCommand: "namecheap.domains.dns.setHosts",
      commandResponse: {
        domainDnsSetHostsResult: ["domain51.com"],
        type: "namecheap.domains.dns.setHosts",
      },
      server: "SERVER-NAME",
      gmtTimeDifference: 5,
      executionTime: 32.76,
      xmlns: "https://api.namecheap.com/xml.response",
      status: "OK",
    };

    vi.spyOn(service, "request").mockResolvedValue(mockResponse);

    const hosts = [
      {
        hostname: "@",
        recordType: RecordType.A,
        address: "213.87.128.103",
        ttl: 3600,
      },
      {
        hostname: "@",
        recordType: RecordType.AAAA,
        address: "8f1f:6f14:ca8e:e50c:6a3a:7f30:2814:5d70",
        ttl: 300,
      },
      {
        hostname: "@",
        recordType: RecordType.CAA,
        address: '0 issue "iva.name"',
        ttl: 1800,
      },
      {
        hostname: "www",
        recordType: RecordType.CNAME,
        address: "chasity.biz.",
        ttl: 1200,
      },
      {
        hostname: "dk1024-2012._domainkey.returnpath.com.",
        recordType: RecordType.TXT,
        address: "Aut et sed sit quos aut harum omnis molestias asperiores.",
        ttl: 1200,
      },
      {
        hostname: "ns",
        recordType: RecordType.NS,
        address: "gabriel.info.",
        ttl: 3600,
      },
    ];

    const params: Omit<
      SetDNSHostsParams,
      "sld" | "tld" | "address" | "hostname" | "mxpref" | "recordType" | "ttl"
    > & { hosts: Array<Host> } = {
      hosts,
    };

    const result = await dns.setHosts("msvec1664270616687", "xyz", params);

    expect(service.request).toHaveBeenCalled();
    expect(result).toBe(mockResponse.commandResponse.domainDnsSetHostsResult);
  });
});
