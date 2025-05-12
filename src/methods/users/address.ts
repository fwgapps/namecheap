import {NamecheapProps} from "@fwg/types/config.type";
import {request} from "@fwg/utils/service";
import {CommandsUserAddress} from "@fwg/utils/commands";
import {
    AddressCreateResult,
    AddressDeleteResult, AddressGetListResult,
    GetAddressInfoResult
} from "@fwg/types/methods/response/users-address.type";
import {CreateUserAddressParams, UpdateUserAddressParams} from "@fwg/types/methods/params/users-address-params.type";

export class UsersAddress {
    private readonly config: NamecheapProps;

    constructor(config: NamecheapProps) {
        this.config = config;
    }

    async create(param: CreateUserAddressParams): Promise<AddressCreateResult> {
        const response = await request(this.config, CommandsUserAddress.Create, param);
        return response.commandResponse.addressCreateResult
    }

    async delete(addressId: number): Promise<AddressDeleteResult> {
        const response = await request(this.config, CommandsUserAddress.Delete, {
            addressId
        });

        return response.commandResponse.addressDeleteResult
    }

    async getInfo(addressId: number): Promise<GetAddressInfoResult> {
        const response = await request(this.config, CommandsUserAddress.GetInfo, {
            addressId
        });

        return response.commandResponse.getAddressInfoResult
    }

    async getList(): Promise<AddressGetListResult> {
        const response = await request(this.config, CommandsUserAddress.GetList);

        return response.commandResponse.addressGetListResult
    }

    async setDefault(addressId: number): Promise<number> {
        const response = await request(this.config, CommandsUserAddress.SetDefault, {
            addressId
        });

        return response.commandResponse.addressSetDefaultResult
    }

    async update(addressId: number, params: Omit<UpdateUserAddressParams, "addressId">): Promise<void> {
        const response = await request(this.config, CommandsUserAddress.Update, {
            ...params,
            addressId
        });

        return response.commandResponse.addressUpdateResult
    }
}