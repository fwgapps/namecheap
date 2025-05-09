import type {NamecheapProps} from "@fwg/types/config.type";
import {request} from "@fwg/utils/service";
import {CommandsDomainTransfer} from "@fwg/utils/commands";
import {
    CreateTransferParams,
    GetListTransferParams,
    ListType,
    SortBy
} from "@fwg/types/methods/params/domains-transfer-params.type";
import {
    DomainTransferCreateResult,
    DomainTransferGetStatusResult, TransferGetResult
} from "@fwg/types/methods/response/domains-transfer.type";
import {Paging} from "@fwg/types/methods/base.type";

export class DomainsTransfer {
    private readonly config: NamecheapProps;

    constructor(config: NamecheapProps) {
        this.config = config;
    }

    async create(domain: string, params: Omit<CreateTransferParams, "domainName">): Promise<DomainTransferCreateResult> {
        const response = await request(this.config, CommandsDomainTransfer.Create, {
            domainName: domain,
            ...params
        });
        return response.commandResponse.domainTransferCreateResult;
    }

    async getStatus(id: number): Promise<DomainTransferGetStatusResult> {
        const response = await request(this.config, CommandsDomainTransfer.GetStatus, {
            transferID: id
        });

        return response.commandResponse.domainTransferGetStatusResult;
    }

    async updateStatus(id: number, resubmit: boolean): Promise<number> {
        const response = await request(this.config, CommandsDomainTransfer.UpdateStatus, {
            transferID: id,
            resubmit
        });

        return response.commandResponse.domainTransferUpdateStatusResult;
    }

    async getList(params: GetListTransferParams = {
        listType: ListType.ALL,
        page: 1,
        pageSize: 10,
        sortBy: SortBy.DomainName
    }): Promise<{
        data: Array<TransferGetResult>,
        paging: Paging
    }> {
        const response = await request(this.config, CommandsDomainTransfer.GetList, params);

        return {
            data: response.commandResponse.transferGetListResult,
            paging: response.commandResponse.paging
        }
    }
}
