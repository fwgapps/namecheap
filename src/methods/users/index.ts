import {NamecheapProps} from "@fwg/types/config.type";
import {
    CreateAddFundsRequestParams, CreateUserParams,
    GetPricingUserParams, ResetPasswordParams,
    UpdateParams
} from "@fwg/types/methods/params/users-params.type";
import {request} from "@fwg/utils/service";
import {CommandsUser} from "@fwg/utils/commands";
import {
    GetAddFundsStatusResult,
    UserCreateAddFundsRequest,
    UserGetBalancesResult,
    UserGetPricingResult
} from "@fwg/types/methods/response/users.type";

export class Users {
    private readonly config: NamecheapProps;

    constructor(config: NamecheapProps) {
        this.config = config;
    }

    async getPricing(params: GetPricingUserParams): Promise<UserGetPricingResult> {
        const response = await request(this.config, CommandsUser.GetPricing, params);
        return response.commandResponse.userGetPricingResult
    }

    async getBalances(): Promise<UserGetBalancesResult> {
        const response = await request(this.config, CommandsUser.GetBalances);
        return response.commandResponse.userGetBalancesResult
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<string> {
        const response = await request(this.config, CommandsUser.ChangePassword, {
            oldPassword,
            newPassword
        });
        return response.commandResponse.userChangePasswordResult
    }

    async update(params: UpdateParams): Promise<string> {
        const response = await request(this.config, CommandsUser.Update, params);
        return response.commandResponse.userUpdateResult
    }

    async createAddFundsRequest(username: string, params: Omit<CreateAddFundsRequestParams, "username">): Promise<UserCreateAddFundsRequest> {
        const response = await request(this.config, CommandsUser.CreateAddFundsRequest, {
            ...params,
            username,
        });

        return response.commandResponse.createaddfundsrequestresult
    }

    async getAddFundsStatus(tokenId: string): Promise<GetAddFundsStatusResult> {
        const response = await request(this.config, CommandsUser.GetAddFundsStatus, {
            tokenId
        });

        return response.commandResponse.getAddFundsStatusResult
    }

    async create(param: CreateUserParams): Promise<number> {
        const response = await request(this.config, CommandsUser.Create, param);

        return response.commandResponse.userCreateResult
    }

    async login(password: string): Promise<string> {
        const response = await request(this.config, CommandsUser.Login, {
            password
        });

        return response.commandResponse.userLoginResult
    }

    async resetPassword(params: ResetPasswordParams): Promise<string> {
        const response = await request(this.config, CommandsUser.ResetPassword, params);

        return response.commandResponse.userResetPasswordResult
    }
}