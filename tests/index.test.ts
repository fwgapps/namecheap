import { describe, it, expect, vi } from "vitest";
import Namecheap from "../src/index";

vi.mock("../src/utils/service", () => ({
  getNamecheapHost: vi.fn(() => "https://api.sandbox.namecheap.com"),
}));

vi.mock("../src/methods/domains", () => ({
  Domains: vi.fn().mockImplementation(() => ({ mock: "domains" })),
}));
vi.mock("../src/methods/domains/dns", () => ({
  DomainsDNS: vi.fn().mockImplementation(() => ({ mock: "dns" })),
}));
vi.mock("../src/methods/domains/ns", () => ({
  DomainsNS: vi.fn().mockImplementation(() => ({ mock: "ns" })),
}));
vi.mock("../src/methods/domains/transfer", () => ({
  DomainsTransfer: vi.fn().mockImplementation(() => ({ mock: "transfer" })),
}));
vi.mock("../src/methods/ssl", () => ({
  SSL: vi.fn().mockImplementation(() => ({ mock: "ssl" })),
}));
vi.mock("../src/methods/users", () => ({
  Users: vi.fn().mockImplementation(() => ({ mock: "users" })),
}));
vi.mock("../src/methods/users/address", () => ({
  UsersAddress: vi.fn().mockImplementation(() => ({ mock: "address" })),
}));
vi.mock("../src/methods/whois-guard", () => ({
  WhoIsGuard: vi.fn().mockImplementation(() => ({ mock: "guard" })),
}));

describe("Namecheap", () => {
  const config = {
    apiUser: "user",
    apiKey: "key",
    username: "user",
    clientIp: "127.0.0.1",
    sandbox: true,
  };

  it("should instantiate with all services", () => {
    const namecheap = new Namecheap(config);

    expect(namecheap.domains).toEqual({ mock: "domains" });
    expect(namecheap.domainsDns).toEqual({ mock: "dns" });
    expect(namecheap.domainsNs).toEqual({ mock: "ns" });
    expect(namecheap.domainsTransfer).toEqual({ mock: "transfer" });
    expect(namecheap.ssl).toEqual({ mock: "ssl" });
    expect(namecheap.users).toEqual({ mock: "users" });
    expect(namecheap.usersAddress).toEqual({ mock: "address" });
    expect(namecheap.whoIsGuard).toEqual({ mock: "guard" });
    expect(namecheap.domainPrivacy).toEqual({ mock: "guard" });
  });
});
