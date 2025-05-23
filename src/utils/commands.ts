export enum CommandsDomain {
  GetList = "namecheap.domains.getList",
  GetContact = "namecheap.domains.getContacts",
  Create = "namecheap.domains.create",
  GetTldList = "namecheap.domains.getTldList",
  SetContact = "namecheap.domains.setContacts",
  Check = "namecheap.domains.check",
  Reactivate = "namecheap.domains.reactivate",
  Renew = "namecheap.domains.renew",
  GetRegistrarLock = "namecheap.domains.getRegistrarLock",
  SetRegistrarLock = "namecheap.domains.setRegistrarLock",
  GetInfo = "namecheap.domains.getInfo",
}

export enum CommandsDomainDNS {
  SetDefault = "namecheap.domains.dns.setDefault",
  SetCustom = "namecheap.domains.dns.setCustom",
  GetList = "namecheap.domains.dns.getList",
  GetHosts = "namecheap.domains.dns.getHosts",
  GetEmailForwarding = "namecheap.domains.dns.getEmailForwarding",
  SetEmailForwarding = "namecheap.domains.dns.setEmailForwarding",
  SetHosts = "namecheap.domains.dns.setHosts",
}

export enum CommandsDomainNS {
  Create = "namecheap.domains.ns.create",
  Delete = "namecheap.domains.ns.delete",
  GetInfo = "namecheap.domains.ns.getInfo",
  Update = "namecheap.domains.ns.update",
}

export enum CommandsDomainTransfer {
  Create = "namecheap.domains.transfer.create",
  GetStatus = "namecheap.domains.transfer.getStatus",
  UpdateStatus = "namecheap.domains.transfer.updateStatus",
  GetList = "namecheap.domains.transfer.getList",
}

export enum CommandsSSL {
  Create = "namecheap.ssl.create",
  GetList = "namecheap.ssl.getList",
  ParseCRS = "namecheap.ssl.parseCSR",
  GetApproverEmailList = "namecheap.ssl.getApproverEmailList",
  Activate = "namecheap.ssl.activate",
  ResendApproverEmail = "namecheap.ssl.resendApproverEmail",
  GetInfo = "namecheap.ssl.getInfo",
  Renew = "namecheap.ssl.renew",
  Reissue = "namecheap.ssl.reissue",
  ResendFulfillmentEmail = "namecheap.ssl.resendfulfillmentemail",
  PurchaseMoreSANS = "namecheap.ssl.purchasemoresans",
  RevokeCertificate = "namecheap.ssl.revokecertificate",
  EditDCVMethod = "namecheap.ssl.editDCVMethod",
}

export enum CommandsUser {
  GetPricing = "namecheap.users.getPricing",
  GetBalances = "namecheap.users.getBalances",
  ChangePassword = "namecheap.users.changePassword",
  Update = "namecheap.users.update",
  CreateAddFundsRequest = "namecheap.users.createaddfundsrequest",
  GetAddFundsStatus = "namecheap.users.getAddFundsStatus",
  Create = "namecheap.users.create",
  Login = "namecheap.users.login",
  ResetPassword = "namecheap.users.resetPassword",
}

export enum CommandsUserAddress {
  Create = "namecheap.users.address.create",
  Delete = "namecheap.users.address.delete",
  GetInfo = "namecheap.users.address.getInfo",
  GetList = "namecheap.users.address.getList",
  SetDefault = "namecheap.users.address.setDefault",
  Update = "namecheap.users.address.update",
}

export enum CommandsWhoIsGuard {
  ChangeEmailAddress = "namecheap.whoisguard.changeemailaddress",
  Enable = "namecheap.whoisguard.enable",
  Disable = "namecheap.whoisguard.disable",
  GetList = "namecheap.whoisguard.getList",
  Renew = "namecheap.whoisguard.renew",
}
