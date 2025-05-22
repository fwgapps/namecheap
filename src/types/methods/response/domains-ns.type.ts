interface GenericDomain {
  domain: string;
  nameserver: string;
}

export interface DomainNsCreateResult extends GenericDomain {
  ip: string;
  isSuccess: boolean;
}

export interface CreateNSSuccess {
  domainNsCreateResult: DomainNsCreateResult;
}

export interface DomainNsDeleteResult extends GenericDomain {
  isSuccess: boolean;
}

export interface DeleteNSSuccess {
  domainNsDeleteResult: DomainNsDeleteResult;
}

export interface DomainNsInfoResult extends GenericDomain {
  nameserverStatuses: Array<string>;
}

export interface GetNSInfoSuccess {
  domainNsInfoResult: DomainNsInfoResult;
}

export interface DomainNsUpdateResult {
  domain: string;
  nameserverStatuses: Array<string>;
  isSuccess: boolean;
}

export interface UpdateNSSuccess {
  domainNsUpdateResult: DomainNsUpdateResult;
}
