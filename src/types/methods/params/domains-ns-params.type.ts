export interface CreateNSParams {
  sld: string;
  tld: string;
  nameserver: string;
  ip: string;
}

export interface DeleteNSParams {
  sld: string;
  tld: string;
  nameserver: string;
}

export interface UpdateNSParams {
  sld: string;
  tld: string;
  nameserver: string;
  ip: string;
  oldIp: string;
}

export interface GetInfoNSParams {
  sld: string;
  tld: string;
  nameserver: string;
}
