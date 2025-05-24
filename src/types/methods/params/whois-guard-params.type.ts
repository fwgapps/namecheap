import type { WhoIsListType } from "@fwg/types/enum";

export interface ChangeEmailAddressParams {
  whoIsGuardId: number;
}

export interface EnableParams {
  whoIsGuardId: number;
  forwardedToEmail: string;
}

export interface DisableParams {
  whoIsGuardId: number;
}

export interface GetListParams {
  listType?: WhoIsListType;
  page?: number;
  pageSize?: number;
}

export interface RenewParams {
  whoIsGuardId: string;
  year: number;
  promotionCode?: number;
}
