import { NamecheapProps } from "@fwg/types/config.type";
import {
  ActivateSSLParams,
  CreateSSLParams,
  EditDCVMethodParams,
  GetListSSLParams,
  ReissueSSLParams,
  RenewSSLParams,
  SSLType,
} from "@fwg/types/methods/params/ssl-params.type";
import { request, requestPost } from "@fwg/utils/service";
import { CommandsSSL } from "@fwg/utils/commands";
import {
  GetApproverEmailListResult,
  SSLActivateResult,
  SSLCreateResult,
  SSLEditDcvMethodResult,
  SSLGetInfoResult,
  SSLParseCsrResult,
  SSLPurchaseMoreSansResult,
  SSLRenewResult,
  SSLResult,
} from "@fwg/types/methods/response/ssl.type";

export class SSL {
  private readonly config: NamecheapProps;

  constructor(config: NamecheapProps) {
    this.config = config;
  }

  async create(params: CreateSSLParams): Promise<SSLCreateResult> {
    const response = await request(this.config, CommandsSSL.Create, params);
    return response.commandResponse.sslCreateResult;
  }

  async getList(params: GetListSSLParams): Promise<Array<SSLResult>> {
    const response = await request(this.config, CommandsSSL.GetList, params);
    return response.commandResponse.sslListResult;
  }

  async parseCSR(csr: string, certificateType?: SSLType): Promise<SSLParseCsrResult> {
    const response = await requestPost(this.config, CommandsSSL.ParseCRS, {
      csr,
      certificateType,
    });

    return response.commandResponse.sslParseCsrResult;
  }

  async getApproverEmailList(
    domainName: string,
    certificateType?: SSLType,
  ): Promise<GetApproverEmailListResult> {
    const response = await request(this.config, CommandsSSL.GetApproverEmailList, {
      domainName,
      certificateType,
    });
    return response.commandResponse.getApproverEmailListResult;
  }

  async activate(
    certificateId: number,
    params: Omit<ActivateSSLParams, "certificateId">,
  ): Promise<SSLActivateResult> {
    const response = await request(this.config, CommandsSSL.Activate, {
      certificateId,
      ...params,
    });

    return response.commandResponse.sslActivateResult;
  }

  async resendApproverEmail(certificateId: number): Promise<number> {
    const response = await request(this.config, CommandsSSL.ResendApproverEmail, {
      certificateId,
    });

    return response.commandResponse.sslResendApproverEmailResult;
  }

  async getInfo(certificateId: number): Promise<SSLGetInfoResult> {
    const response = await request(this.config, CommandsSSL.GetInfo, {
      certificateId,
    });

    return response.commandResponse.sslGetInfoResult;
  }

  async renew(
    certificateId: number,
    params: Omit<RenewSSLParams, "certificateId">,
  ): Promise<SSLRenewResult> {
    const response = await request(this.config, CommandsSSL.Renew, {
      certificateId,
      ...params,
    });

    return response.commandResponse.sslRenewResult;
  }

  async reissue(
    certificateId: number,
    params: Omit<ReissueSSLParams, "certificateId">,
  ): Promise<SSLActivateResult> {
    const response = await request(this.config, CommandsSSL.Reissue, {
      certificateId,
      ...params,
    });

    return response.commandResponse.sslActivateResult;
  }

  async resendFulfillmentEmail(certificateId: number): Promise<number> {
    const response = await request(this.config, CommandsSSL.ResendFulfillmentEmail, {
      certificateId,
    });

    return response.commandResponse.sslResendFulfillmentEmailResult;
  }

  async purchaseMoreSANS(
    certificateId: number,
    numberOfSANSToAdd: number,
  ): Promise<SSLPurchaseMoreSansResult> {
    const response = await request(this.config, CommandsSSL.PurchaseMoreSANS, {
      certificateId,
      numberOfSANSToAdd,
    });

    return response.commandResponse.sslPurchaseMoreSansResult;
  }

  async revokeCertificate(certificateId: number, certificateType: SSLType): Promise<number> {
    const response = await request(this.config, CommandsSSL.RevokeCertificate, {
      certificateId,
      certificateType,
    });

    return response.commandResponse.revokeCertificateResult;
  }

  async editDCVMethod(
    certificateId: number,
    params: Omit<EditDCVMethodParams, "certificateId">,
  ): Promise<SSLEditDcvMethodResult> {
    const response = await request(this.config, CommandsSSL.EditDCVMethod, {
      certificateId,
      ...params,
    });

    return response.commandResponse.sslEditDcvMethodResult;
  }
}
