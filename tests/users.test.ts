import { describe, expect, it } from "vitest";
import Namecheap, { NamecheapError, NamecheapHttpError, NamecheapParseError } from "../src";
import { usersCommands } from "../src/commands/users";
import { createTestClient, loadFixture, okEnvelope } from "./helpers";

describe("users", () => {
  it("getBalances sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users", "getBalances"));
    const result = await client.users.getBalances();
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.getBalances");
    expect(result).toEqual({
      currency: "USD",
      availableBalance: "123.45",
      accountBalance: "123.45",
      earnedAmount: "15.00",
      withdrawableAmount: "100.00",
      fundsRequiredForAutoRenew: "42.50",
    });
  });

  it("getPricing sends the documented request and parses every nested level as an array", async () => {
    const { client, calls } = createTestClient(loadFixture("users", "getPricing"));
    const result = await client.users.getPricing({
      productType: "DOMAIN",
      productCategory: "REGISTER",
      promotionCode: "PROMO",
      actionName: "REGISTER",
      productName: "com",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.getPricing");
    expect(calls[0]?.body.get("ProductType")).toBe("DOMAIN");
    expect(calls[0]?.body.get("ProductCategory")).toBe("REGISTER");
    expect(calls[0]?.body.get("PromotionCode")).toBe("PROMO");
    expect(calls[0]?.body.get("ActionName")).toBe("REGISTER");
    expect(calls[0]?.body.get("ProductName")).toBe("com");
    expect(result).toEqual({
      productTypes: [
        {
          name: "domains",
          productCategories: [
            {
              name: "register",
              products: [
                {
                  name: "com",
                  prices: [
                    {
                      duration: 1,
                      durationType: "YEAR",
                      price: "8.88",
                      pricingType: "MULTIPLE",
                      regularPrice: "10.87",
                      regularPriceType: "MULTIPLE",
                      yourPrice: "9.99",
                      yourPriceType: "MULTIPLE",
                      currency: "USD",
                    },
                    {
                      duration: 2,
                      durationType: "YEAR",
                      price: "17.76",
                      regularPrice: "21.74",
                      yourPrice: "19.98",
                      currency: "USD",
                    },
                  ],
                },
                {
                  name: "net",
                  prices: [
                    {
                      duration: 1,
                      durationType: "YEAR",
                      price: "0.0",
                      regularPrice: "12.00",
                      yourPrice: "10.50",
                      currency: "USD",
                    },
                  ],
                },
                {
                  name: "org",
                  prices: [
                    {
                      duration: 1,
                      durationType: "YEAR",
                      price: "",
                      regularPrice: "9.18",
                      yourPrice: "0.00",
                      currency: "USD",
                    },
                  ],
                },
              ],
            },
            {
              name: "renew",
              products: [
                {
                  name: "com",
                  prices: [
                    {
                      duration: 1,
                      durationType: "YEAR",
                      price: "11.00",
                      regularPrice: "12.88",
                      yourPrice: "11.50",
                      currency: "USD",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    // Single-item levels stay arrays.
    expect(Array.isArray(result.productTypes)).toBe(true);
    expect(result.productTypes[0]?.productCategories[1]?.products).toHaveLength(1);
    expect(result.productTypes[0]?.productCategories[1]?.products[0]?.prices).toHaveLength(1);
  });

  it("getPricing parses a documented promotionPrice when present", async () => {
    const xml = loadFixture("users", "getPricing").replace(
      'Duration="2" DurationType="YEAR"',
      'Duration="2" DurationType="YEAR" PromotionPrice="7.77"',
    );
    const { client } = createTestClient(xml);
    const result = await client.users.getPricing({ productType: "DOMAIN" });
    expect(
      result.productTypes[0]?.productCategories[0]?.products[0]?.prices[1]?.promotionPrice,
    ).toBe("7.77");
  });

  it("changePassword sends the documented request (old password method) and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users", "changePassword"));
    const result = await client.users.changePassword({
      oldPassword: "old-pw",
      newPassword: "new-pw",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.changePassword");
    expect(calls[0]?.body.get("OldPassword")).toBe("old-pw");
    expect(calls[0]?.body.get("NewPassword")).toBe("new-pw");
    expect(calls[0]?.body.has("ResetCode")).toBe(false);
    expect(result).toEqual({ success: true, userID: 4242 });
  });

  it("changePassword sends the reset code method", async () => {
    const { client, calls } = createTestClient(loadFixture("users", "changePassword"));
    await client.users.changePassword({ resetCode: "code-1", newPassword: "new-pw" });
    expect(calls[0]?.body.get("ResetCode")).toBe("code-1");
    expect(calls[0]?.body.get("NewPassword")).toBe("new-pw");
    expect(calls[0]?.body.has("OldPassword")).toBe(false);
  });

  it("update sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users", "update"));
    const result = await client.users.update({
      firstName: "Jane",
      lastName: "Doe",
      jobTitle: "Engineer",
      organization: "Example Org",
      address1: "1 Example St",
      address2: "Suite 2",
      city: "Springfield",
      stateProvince: "CA",
      zip: "90001",
      country: "US",
      emailAddress: "jane@example.com",
      phone: "+1.5555555555",
      phoneExt: "12",
      fax: "+1.5555555556",
    });
    const body = calls[0]?.body;
    expect(body?.get("Command")).toBe("namecheap.users.update");
    expect(body?.get("FirstName")).toBe("Jane");
    expect(body?.get("LastName")).toBe("Doe");
    expect(body?.get("JobTitle")).toBe("Engineer");
    expect(body?.get("Organization")).toBe("Example Org");
    expect(body?.get("Address1")).toBe("1 Example St");
    expect(body?.get("Address2")).toBe("Suite 2");
    expect(body?.get("City")).toBe("Springfield");
    expect(body?.get("StateProvince")).toBe("CA");
    expect(body?.get("Zip")).toBe("90001");
    expect(body?.get("Country")).toBe("US");
    expect(body?.get("EmailAddress")).toBe("jane@example.com");
    expect(body?.get("Phone")).toBe("+1.5555555555");
    expect(body?.get("PhoneExt")).toBe("12");
    expect(body?.get("Fax")).toBe("+1.5555555556");
    expect(result).toEqual({ success: true });
  });

  it("createAddFundsRequest sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users", "createAddFundsRequest"));
    const result = await client.users.createAddFundsRequest({
      paymentType: "Creditcard",
      amount: 50,
      returnUrl: "https://example.com/done",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.createaddfundsrequest");
    expect(calls[0]?.body.get("PaymentType")).toBe("Creditcard");
    expect(calls[0]?.body.get("Amount")).toBe("50");
    expect(calls[0]?.body.get("ReturnUrl")).toBe("https://example.com/done");
    // The documented `Username` is the account the transport already sends as `UserName`.
    expect(calls[0]?.body.get("UserName")).toBe("test-user");
    expect(result).toEqual({
      tokenID: "1234567890",
      redirectURL: "https://sandbox.namecheap.com/addfunds?token=1234567890",
      returnURL: "https://example.com/done",
    });
  });

  it("getAddFundsStatus sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users", "getAddFundsStatus"));
    const result = await client.users.getAddFundsStatus({ tokenId: "1234567890" });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.getAddFundsStatus");
    expect(calls[0]?.body.get("TokenId")).toBe("1234567890");
    expect(result).toEqual({ transactionID: 998877, amount: "50.00", status: "COMPLETED" });
  });

  it("create sends the documented request and parses the docs-derived fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users", "create"));
    const result = await client.users.create({
      newUserName: "new-user",
      newUserPassword: "pw-SECRET-create",
      emailAddress: "jane@example.com",
      ignoreDuplicateEmailAddress: "Yes",
      firstName: "Jane",
      lastName: "Doe",
      acceptTerms: 1,
      acceptNews: 0,
      jobTitle: "Engineer",
      organization: "Example Org",
      address1: "1 Example St",
      address2: "Suite 2",
      city: "Springfield",
      stateProvince: "CA",
      zip: "90001",
      country: "US",
      phone: "+1.5555555555",
      phoneExt: "12",
      fax: "+1.5555555556",
    });
    const body = calls[0]?.body;
    expect(body?.get("Command")).toBe("namecheap.users.create");
    expect(body?.get("NewUserName")).toBe("new-user");
    expect(body?.get("NewUserPassword")).toBe("pw-SECRET-create");
    expect(body?.get("EmailAddress")).toBe("jane@example.com");
    expect(body?.get("IgnoreDuplicateEmailAddress")).toBe("Yes");
    expect(body?.get("FirstName")).toBe("Jane");
    expect(body?.get("LastName")).toBe("Doe");
    expect(body?.get("AcceptTerms")).toBe("1");
    expect(body?.get("AcceptNews")).toBe("0");
    expect(body?.get("JobTitle")).toBe("Engineer");
    expect(body?.get("Organization")).toBe("Example Org");
    expect(body?.get("Address1")).toBe("1 Example St");
    expect(body?.get("Address2")).toBe("Suite 2");
    expect(body?.get("City")).toBe("Springfield");
    expect(body?.get("StateProvince")).toBe("CA");
    expect(body?.get("Zip")).toBe("90001");
    expect(body?.get("Country")).toBe("US");
    expect(body?.get("Phone")).toBe("+1.5555555555");
    expect(body?.get("PhoneExt")).toBe("12");
    expect(body?.get("Fax")).toBe("+1.5555555556");
    expect(result).toEqual({ Success: "true" });
    expect(JSON.stringify(result)).not.toContain("pw-SECRET-create");
  });

  it("login sends the documented request and parses the docs-derived fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users", "login"));
    const result = await client.users.login({ password: "pw-SECRET-login" });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.users.login");
    expect(calls[0]?.body.get("Password")).toBe("pw-SECRET-login");
    expect(result).toEqual({ username: "example-user", loginSuccess: true });
    expect(JSON.stringify(result)).not.toContain("pw-SECRET-login");
  });

  it("login and resetPassword do not throw on unacceptable boolean values and omit the field", async () => {
    const wrap = (cmd: string, body: string) => `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
	<Errors />
	<CommandResponse Type="${cmd}">${body}</CommandResponse>
</ApiResponse>`;
    const login = createTestClient(
      wrap("namecheap.users.login", '<R Username="u" LoginSuccess="maybe" />'),
    );
    expect(await login.client.users.login({ password: "pw" })).toEqual({ username: "u" });
    const reset = createTestClient(wrap("namecheap.users.resetPassword", '<R Success="yes" />'));
    expect(
      await reset.client.users.resetPassword({
        findBy: "USERNAME",
        findByValue: "u",
        emailFromName: "E",
        emailFrom: "a@example.com",
        urlPattern: "https://example.com/[RESETCODE]",
      }),
    ).toEqual({});
  });

  it("resetPassword sends the documented request and parses the docs-derived fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("users", "resetPassword"));
    const result = await client.users.resetPassword({
      findBy: "EMAILADDRESS",
      findByValue: "jane@example.com",
      emailFromName: "Example",
      emailFrom: "noreply@example.com",
      urlPattern: "https://example.com/reset/[RESETCODE]",
    });
    const body = calls[0]?.body;
    expect(body?.get("Command")).toBe("namecheap.users.resetPassword");
    expect(body?.get("FindBy")).toBe("EMAILADDRESS");
    expect(body?.get("FindByValue")).toBe("jane@example.com");
    expect(body?.get("EmailFromName")).toBe("Example");
    expect(body?.get("EmailFrom")).toBe("noreply@example.com");
    expect(body?.get("URLPattern")).toBe("https://example.com/reset/[RESETCODE]");
    expect(result).toEqual({ success: true });
  });

  it("rejects with NamecheapError carrying the code and message of an error response", async () => {
    const { client } = createTestClient(loadFixture("users", "error"));
    const error = await client.users
      .changePassword({ oldPassword: "a", newPassword: "b" })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NamecheapError);
    expect((error as NamecheapError).code).toBe(2010302);
    expect((error as NamecheapError).message).toBe("Invalid password");
  });

  describe("credential leaks", () => {
    const [pw1, pw2, pw3, code4] = [
      "pw-SECRET-1",
      "pw-SECRET-2",
      "pw-SECRET-3",
      "code-SECRET-4",
    ] as [string, string, string, string];
    const secrets = [pw1, pw2, pw3, code4];
    const createParams = {
      newUserName: "u",
      newUserPassword: pw2,
      emailAddress: "a@example.com",
      firstName: "A",
      lastName: "B",
      acceptTerms: 1,
      address1: "x",
      city: "x",
      stateProvince: "x",
      zip: "1",
      country: "US",
      phone: "+1.1",
    };
    const calls: Array<[string, (c: Namecheap) => Promise<unknown>]> = [
      [
        "changePassword (old)",
        (c) => c.users.changePassword({ oldPassword: pw1, newPassword: pw2 }),
      ],
      [
        "changePassword (code)",
        (c) => c.users.changePassword({ resetCode: code4, newPassword: pw3 }),
      ],
      ["login", (c) => c.users.login({ password: pw1 })],
      ["create", (c) => c.users.create(createParams)],
      [
        "resetPassword",
        (c) =>
          c.users.resetPassword({
            findBy: "USERNAME",
            findByValue: "u",
            urlPattern: `https://e.example/${code4}/[RESETCODE]`,
          }),
      ],
    ];

    const clientFor = (fetchImpl: typeof fetch): Namecheap =>
      new Namecheap({
        apiUser: "test-user",
        apiKey: "SECRET-KEY",
        clientIp: "127.0.0.1",
        sandbox: true,
        fetch: fetchImpl,
      });
    const respond = (body: string, status = 200): typeof fetch =>
      (() => Promise.resolve(new Response(body, { status }))) as typeof fetch;

    function exposed(error: Error): string {
      const own = Object.getOwnPropertyNames(error)
        .filter((name) => name !== "stack")
        .map((name) => JSON.stringify((error as unknown as Record<string, unknown>)[name]));
      return [
        error.message,
        error.stack ?? "",
        String(error),
        JSON.stringify(own),
        String((error as { cause?: unknown }).cause),
        JSON.stringify(Object.fromEntries(Object.entries(error))),
      ].join("\n");
    }

    const scenarios: Array<[string, typeof fetch, new (...a: never[]) => Error]> = [
      ["NamecheapError", respond(loadFixture("users", "error")), NamecheapError],
      ["HTTP 500", respond("server down", 500), NamecheapHttpError],
      [
        "rejected fetch",
        (() => Promise.reject(new Error("socket hang up"))) as typeof fetch,
        NamecheapHttpError,
      ],
      ["unparseable body", respond("<html>x</html>"), NamecheapParseError],
    ];

    for (const [label, fetchImpl, ErrorClass] of scenarios) {
      for (const [command, run] of calls) {
        it(`${command} against ${label} exposes no secret`, async () => {
          const error = (await run(clientFor(fetchImpl)).catch((e: unknown) => e)) as Error;
          expect(error).toBeInstanceOf(ErrorClass);
          const text = exposed(error);
          for (const secret of secrets) expect(text).not.toContain(secret);
        });
      }
    }
  });

  it("keeps every command key consistent with its Namecheap command name", () => {
    expect(Object.keys(usersCommands)).toHaveLength(9);
    for (const [key, command] of Object.entries(usersCommands)) {
      expect(command.name.split(".").at(-1)?.toLowerCase()).toBe(key.toLowerCase());
    }
  });

  describe("undocumented responses are parsed tolerantly", () => {
    const envelope = (inner: string): string =>
      `<?xml version="1.0"?><ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response"><Errors /><CommandResponse Type="x">${inner}</CommandResponse></ApiResponse>`;
    const createParams = {
      newUserName: "u",
      newUserPassword: "p",
      emailAddress: "a@example.com",
      firstName: "A",
      lastName: "B",
      acceptTerms: 1,
      address1: "x",
      city: "x",
      stateProvince: "x",
      zip: "1",
      country: "US",
      phone: "+1.1",
    };

    it("login accepts any result element name and absent attributes", async () => {
      const named = createTestClient(
        envelope('<Whatever Username="example-user" LoginSuccess="false" />'),
      );
      expect(await named.client.users.login({ password: "p" })).toEqual({
        username: "example-user",
        loginSuccess: false,
      });
      const empty = createTestClient(envelope(""));
      expect(await empty.client.users.login({ password: "p" })).toEqual({});
    });

    it("resetPassword accepts any result element name and absent attributes", async () => {
      const named = createTestClient(envelope('<Whatever Success="true" />'));
      expect(
        await named.client.users.resetPassword({ findBy: "USERNAME", findByValue: "u" }),
      ).toEqual({ success: true });
      const empty = createTestClient(envelope(""));
      expect(
        await empty.client.users.resetPassword({ findBy: "USERNAME", findByValue: "u" }),
      ).toEqual({});
    });

    it("create returns the attributes of any result element, or an empty object", async () => {
      const named = createTestClient(envelope('<Whatever Success="true" UserId="7" />'));
      expect(await named.client.users.create(createParams)).toEqual({
        Success: "true",
        UserId: "7",
      });
      const empty = createTestClient(envelope(""));
      expect(await empty.client.users.create(createParams)).toEqual({});
    });
  });

  it("changePassword reads UserId, or no id at all, as the live API may send", async () => {
    const spelled = createTestClient(
      okEnvelope(
        `<UserChangePasswordResult Success="true" UserId="9" />`,
        "namecheap.users.changePassword",
      ),
    );
    await expect(
      spelled.client.users.changePassword({ oldPassword: "a", newPassword: "b" }),
    ).resolves.toEqual({ success: true, userID: 9 });
    const bare = createTestClient(
      okEnvelope(`<UserChangePasswordResult Success="true" />`, "namecheap.users.changePassword"),
    );
    await expect(
      bare.client.users.changePassword({ oldPassword: "a", newPassword: "b" }),
    ).resolves.toEqual({ success: true });
  });

  it("createAddFundsRequest and getAddFundsStatus read the lower-case elements the API sends", async () => {
    const created = createTestClient(
      okEnvelope(
        `<Createaddfundsrequestresult TokenID="t1" ReturnURL="https://r.example/" RedirectURL="https://p.example/" />`,
        "namecheap.users.createAddfundsRequest",
      ),
    );
    await expect(
      created.client.users.createAddFundsRequest({
        paymentType: "Creditcard",
        amount: 5,
        returnUrl: "https://r.example/",
      }),
    ).resolves.toEqual({
      tokenID: "t1",
      redirectURL: "https://p.example/",
      returnURL: "https://r.example/",
    });
    const status = createTestClient(
      okEnvelope(
        `<Getaddfundsstatusresult TransactionID="7" Amount="5.00" Status="CREATED" />`,
        "namecheap.users.getAddFundsStatus",
      ),
    );
    await expect(status.client.users.getAddFundsStatus({ tokenId: "t1" })).resolves.toEqual({
      transactionID: 7,
      amount: "5.00",
      status: "CREATED",
    });
  });
});
