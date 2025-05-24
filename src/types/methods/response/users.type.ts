import type { GetAddFundsStatus } from "@fwg/types/enum";

export interface Product {
  duration: number;
  durationType: string;
  price: number;
  regularPrice: number;
  yourPrice: number;
  currency: string;
}

export interface ProductCategory {
  product: Array<Product>;
  name: string;
}

export interface UserGetPricingResult {
  productCategory: Array<ProductCategory>;
  name: string;
}

export interface UserGetPricingBaseResult {
  userGetPricingResult: UserGetPricingResult;
}

export interface UserGetBalancesResult {
  currency: string;
  availableBalance: number;
  accountBalance: number;
  earnedAmount: number;
  withdrawableAmount: number;
  fundsRequiredForAutoRenew: number;
}

export interface UserGetBalancesBaseResult {
  userGetBalancesResult: UserGetBalancesResult;
}

export interface UserChangePasswordBaseResult {
  userChangePasswordResult: string;
}

export interface UserUpdateBaseResult {
  userUpdateResult: string;
}

export interface UserCreateAddFundsRequest {
  tokenId: string;
  returnUrl: string;
  redirectUrl: string;
}

export interface UserCreateAddFundsRequestBaseResult {
  createaddfundsrequestresult: UserCreateAddFundsRequest;
}

export interface GetAddFundsStatusResult {
  transactionId: number;
  amount: number;
  status: GetAddFundsStatus;
}

export interface UserGetAddFundsStatusBaseResult {
  getAddFundsStatusResult: GetAddFundsStatusResult;
}

export interface UserCreateBaseResult {
  userCreateResult: number;
}

export interface UserLoginBaseResult {
  userLoginResult: string;
}

export interface UserResetPasswordBaseResult {
  userResetPasswordResult: string;
}
