import type {
  UserActionName,
  UserListFindBy,
  UserPaymentType,
  UserProductCategory,
  UserProductName,
  UserProductType,
} from "@fwg/types/enum";

export interface GetPricingUserParams {
  productType: UserProductType;
  productCategory?: UserProductCategory;
  promotionCode?: string;
  actionName?: UserActionName;
  productName?: UserProductName;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateParams {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  organization?: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  zip: string;
  country: string;
  emailAddress: string;
  phone: string;
  phoneExt?: string;
  fax?: string;
}

export interface CreateAddFundsRequestParams {
  username: string;
  paymentType: typeof UserPaymentType.CreditCard;
  amount: number;
  returnUrl: string;
}

export interface GetAddFundsStatusParams {
  tokenId: string;
}

export interface CreateUserParams {
  newUserName: string;
  newUserPassword: string;
  emailAddress: string;
  ignoreDuplicateEmailAddress?: string;
  firstName: string;
  lastName: string;
  acceptTerms: number;
  acceptNews?: number;
  jobTitle?: string;
  organization?: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  zip: string;
  country: string;
  phone: string;
  phoneExt?: string;
  fax?: string;
}

export interface LoginUserParams {
  password: string;
}

export interface ResetPasswordParams {
  findBy: UserListFindBy;
  findByValue: string;
  emailFromName?: string;
  emailFrom?: string;
  urlPattern?: string;
}
