import { NamecheapProps } from "@fwg/types/config.type";
import { request } from "@fwg/utils/service";
import { CommandsWhoIsGuard } from "@fwg/utils/commands";
import {
  WhoIsGuardChangeEmailAddressResult,
  WhoIsGuardGetListResult,
  WhoIsGuardRenewResult,
} from "@fwg/types/methods/response/whois-guard.type";
import { GetListParams } from "@fwg/types/methods/params/whois-guard-params.type";
import { Paging } from "@fwg/types/methods/base.type";

export class WhoIsGuard {
  private readonly config: NamecheapProps;

  constructor(config: NamecheapProps) {
    this.config = config;
  }

  async changeEmailAddress(whoIsGuardId: number): Promise<WhoIsGuardChangeEmailAddressResult> {
    const response = await request(this.config, CommandsWhoIsGuard.ChangeEmailAddress, {
      whoIsGuardId,
    });

    return response.commandResponse.whoisguardChangeEmailAddressResult;
  }

  async enable(whoIsGuardId: number, forwardedToEmail: string): Promise<string> {
    const response = await request(this.config, CommandsWhoIsGuard.Enable, {
      whoIsGuardId,
      forwardedToEmail,
    });

    return response.commandResponse.whoisguardEnableResult;
  }

  async disable(whoIsGuardId: number): Promise<string> {
    const response = await request(this.config, CommandsWhoIsGuard.Disable, {
      whoIsGuardId,
    });

    return response.commandResponse.whoisguardDisableResult;
  }

  async getList(param: GetListParams): Promise<{
    data: Array<WhoIsGuardGetListResult>;
    paging: Paging;
  }> {
    const response = await request(this.config, CommandsWhoIsGuard.GetList, param);

    return {
      data: response.commandResponse.whoisguardGetListResult,
      paging: response.commandResponse.paging,
    };
  }

  async renew(
    whoIsGuardId: string,
    year: number,
    promotionCode?: number,
  ): Promise<WhoIsGuardRenewResult> {
    const response = await request(this.config, CommandsWhoIsGuard.Renew, {
      whoIsGuardId,
      year,
      promotionCode,
    });

    return response.commandResponse.whoisguardRenewResult;
  }
}
