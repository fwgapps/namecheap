import { defineCommand } from "../core/define";
import { optionalField } from "../core/fields";

// Money values are returned as the strings the API sends: the reference does not
// type them numeric and a fixture carries an empty price.

// ---------------------------------------------------------------------------
// namecheap.users.getBalances
// ---------------------------------------------------------------------------

export interface UsersGetBalancesResult {
  currency: string;
  availableBalance: string;
  accountBalance: string;
  earnedAmount: string;
  withdrawableAmount: string;
  fundsRequiredForAutoRenew: string;
}

const getBalances = defineCommand<Record<string, never>, UsersGetBalancesResult>({
  name: "namecheap.users.getBalances",
  parse: (cr) => {
    const result = cr.one("UserGetBalancesResult");
    return {
      currency: result.string("Currency"),
      availableBalance: result.string("AvailableBalance"),
      accountBalance: result.string("AccountBalance"),
      earnedAmount: result.string("EarnedAmount"),
      withdrawableAmount: result.string("WithdrawableAmount"),
      fundsRequiredForAutoRenew: result.string("FundsRequiredForAutoRenew"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.users.getPricing
// ---------------------------------------------------------------------------

export interface UsersGetPricingParams {
  /** Product type, e.g. `DOMAIN` or `SSLCERTIFICATE` (the reference gives examples, not a closed set). */
  productType: string;
  productCategory?: string;
  promotionCode?: string;
  /** Action, e.g. `REGISTER`, `RENEW` or `TRANSFER` (examples, not a closed set). */
  actionName?: string;
  productName?: string;
}

export interface PricingPrice {
  duration: number;
  durationType: string;
  /** Final price. May be an empty string. */
  price: string;
  regularPrice: string;
  yourPrice: string;
  currency: string;
  /** Present in the fixture but not in the reference table. */
  pricingType?: string;
  /** Present in the fixture but not in the reference table. */
  regularPriceType?: string;
  /** Present in the fixture but not in the reference table. */
  yourPriceType?: string;
  /** Documented; present only when a promotion applies to the tier. */
  promotionPrice?: string;
}

export interface PricingProduct {
  name: string;
  prices: PricingPrice[];
}

export interface PricingProductCategory {
  name: string;
  products: PricingProduct[];
}

export interface PricingProductType {
  name: string;
  productCategories: PricingProductCategory[];
}

export interface UsersGetPricingResult {
  productTypes: PricingProductType[];
}

const getPricing = defineCommand<UsersGetPricingParams, UsersGetPricingResult>({
  name: "namecheap.users.getPricing",
  parse: (cr) => ({
    productTypes: cr
      .one("UserGetPricingResult")
      .all("ProductType")
      .map((type) => ({
        name: type.string("Name"),
        productCategories: type.all("ProductCategory").map((category) => ({
          name: category.string("Name"),
          products: category.all("Product").map((product) => ({
            name: product.string("Name"),
            prices: product.all("Price").map((price) => ({
              duration: price.number("Duration"),
              durationType: price.string("DurationType"),
              price: price.string("Price"),
              regularPrice: price.string("RegularPrice"),
              yourPrice: price.string("YourPrice"),
              currency: price.string("Currency"),
              ...optionalField("pricingType", price.optionalString("PricingType")),
              ...optionalField("regularPriceType", price.optionalString("RegularPriceType")),
              ...optionalField("yourPriceType", price.optionalString("YourPriceType")),
              ...optionalField("promotionPrice", price.optionalString("PromotionPrice")),
            })),
          })),
        })),
      })),
  }),
});

// ---------------------------------------------------------------------------
// namecheap.users.changePassword
// ---------------------------------------------------------------------------

/**
 * Credential-bearing: changes the password of a real account. Either the old
 * password (method 1) or a reset code from `resetPassword` (method 2).
 */
export type UsersChangePasswordParams =
  | { oldPassword: string; newPassword: string }
  | { resetCode: string; newPassword: string };

/** Never echoes a password or reset code. */
export interface UsersChangePasswordResult {
  success: boolean;
  userID: number;
}

const changePassword = defineCommand<UsersChangePasswordParams, UsersChangePasswordResult>({
  name: "namecheap.users.changePassword",
  parse: (cr) => {
    const result = cr.one("UserChangePasswordResult");
    return { success: result.boolean("Success"), userID: result.number("UserID") };
  },
});
// ---------------------------------------------------------------------------
// namecheap.users.update
// ---------------------------------------------------------------------------

export interface UsersUpdateParams {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  organization?: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  zip: string;
  /** Two-letter country code. */
  country: string;
  emailAddress: string;
  /** Format +NNN.NNNNNNNNNN. */
  phone: string;
  phoneExt?: string;
  /** Format +NNN.NNNNNNNNNN. */
  fax?: string;
}

export interface UsersUpdateResult {
  success: boolean;
}

const update = defineCommand<UsersUpdateParams, UsersUpdateResult>({
  name: "namecheap.users.update",
  parse: (cr) => ({ success: cr.one("UserUpdateResult").boolean("Success") }),
});
// ---------------------------------------------------------------------------
// namecheap.users.createaddfundsrequest
// ---------------------------------------------------------------------------

/** The only documented payment type. */
export type UsersPaymentType = "Creditcard";

/**
 * The documented `Username` parameter is not exposed: the transport always sends
 * the configured account as `UserName`.
 */
export interface UsersCreateAddFundsRequestParams {
  paymentType: UsersPaymentType;
  /** Amount to add. */
  amount: number | string;
  /** URL to redirect the user to after payment. Sent as `ReturnUrl`. */
  returnUrl: string;
}

export interface UsersCreateAddFundsRequestResult {
  tokenID: string;
  redirectURL: string;
  returnURL: string;
}

const createAddFundsRequest = defineCommand<
  UsersCreateAddFundsRequestParams,
  UsersCreateAddFundsRequestResult
>({
  name: "namecheap.users.createaddfundsrequest",
  parse: (cr) => {
    const result = cr.one("CreateAddFundsRequestResult");
    return {
      tokenID: result.string("TokenID"),
      redirectURL: result.string("RedirectURL"),
      returnURL: result.string("ReturnURL"),
    };
  },
});
// ---------------------------------------------------------------------------
// namecheap.users.getAddFundsStatus
// ---------------------------------------------------------------------------

export interface UsersGetAddFundsStatusParams {
  /** Token from `createAddFundsRequest`. Sent as `TokenId` (not `TokenID`). */
  tokenId: string;
}

export interface UsersGetAddFundsStatusResult {
  transactionID: number;
  amount: string;
  /** One of CREATED, SUBMITTED, COMPLETED, FAILED, EXPIRED. */
  status: string;
}

const getAddFundsStatus = defineCommand<UsersGetAddFundsStatusParams, UsersGetAddFundsStatusResult>(
  {
    name: "namecheap.users.getAddFundsStatus",
    keys: { tokenId: "TokenId" },
    parse: (cr) => {
      const result = cr.one("GetAddFundsStatusResult");
      return {
        transactionID: result.number("TransactionID"),
        amount: result.string("Amount"),
        status: result.string("Status"),
      };
    },
  },
);
// ---------------------------------------------------------------------------
// namecheap.users.create
// ---------------------------------------------------------------------------

/** Credential-bearing: creates a real account under the ApiUser with its password. */
export interface UsersCreateParams {
  newUserName: string;
  newUserPassword: string;
  emailAddress: string;
  /** Whether to skip the duplicate e-mail check. Default: Yes. */
  ignoreDuplicateEmailAddress?: string;
  firstName: string;
  lastName: string;
  /** Must be 1 to accept the terms. */
  acceptTerms: number;
  /** 1 to receive newsletters, 0 to opt out. */
  acceptNews?: number;
  jobTitle?: string;
  organization?: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  zip: string;
  /** Two-letter country code. */
  country: string;
  /** Format +NNN.NNNNNNNNNN. */
  phone: string;
  phoneExt?: string;
  fax?: string;
}

/**
 * The reference documents no response fields and no sample for this command; the
 * result element `UserCreateResult` follows the naming pattern of the other users
 * commands.
 */
export interface UsersCreateResult {
  success: boolean;
}

const create = defineCommand<UsersCreateParams, UsersCreateResult>({
  name: "namecheap.users.create",
  parse: (cr) => ({ success: cr.one("UserCreateResult").boolean("Success") }),
});
// ---------------------------------------------------------------------------
// namecheap.users.login
// ---------------------------------------------------------------------------

/**
 * Credential-bearing. Validates the password of an account created via
 * `users.create` (the account is the configured `userName`).
 */
export interface UsersLoginParams {
  password: string;
}

/** The reference documents no sample; the result element name follows the other users commands. */
export interface UsersLoginResult {
  username: string;
  loginSuccess: boolean;
}

const login = defineCommand<UsersLoginParams, UsersLoginResult>({
  name: "namecheap.users.login",
  parse: (cr) => {
    const result = cr.one("UserLoginResult");
    return {
      username: result.string("Username"),
      loginSuccess: result.boolean("LoginSuccess"),
    };
  },
});
// ---------------------------------------------------------------------------
// namecheap.users.resetPassword
// ---------------------------------------------------------------------------

export type UsersResetPasswordFindBy = "EMAILADDRESS" | "DOMAINNAME" | "USERNAME";

/** Credential-bearing: e-mails a password reset link for a real account. */
export interface UsersResetPasswordParams {
  findBy: UsersResetPasswordFindBy;
  /** The username, e-mail address or domain to search by. */
  findByValue: string;
  /** Sender name in the reset e-mail. Default: namecheap.com. */
  emailFromName?: string;
  /** Sender address. Default: support@namecheap.com. */
  emailFrom?: string;
  /** URL pattern containing the `[RESETCODE]` placeholder. Sent as `URLPattern`. */
  urlPattern?: string;
}

/** The reference documents no sample; the result element name follows the other users commands. */
export interface UsersResetPasswordResult {
  success: boolean;
}

const resetPassword = defineCommand<UsersResetPasswordParams, UsersResetPasswordResult>({
  name: "namecheap.users.resetPassword",
  keys: { urlPattern: "URLPattern" },
  parse: (cr) => ({ success: cr.one("UserResetPasswordResult").boolean("Success") }),
});
export const usersCommands = {
  getBalances,
  getPricing,
  changePassword,
  update,
  createAddFundsRequest,
  getAddFundsStatus,
  create,
  login,
  resetPassword,
};
