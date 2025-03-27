/**
 * Represents the available command domains for interacting with Namecheap's API.
 * Each enum value corresponds to a specific API operation for managing domains.
 *
 * Enum members:
 * - GetList: Retrieves a list of domains associated with a Namecheap account.
 * - GetContact: Retrieves the contact details associated with a specific domain.
 */
export enum CommandsDomain {
    GetList = "namecheap.domains.getList",
    GetContact = "namecheap.domains.getContacts",
    Create = "namecheap.domains.create",
    GetTldList = "namecheap.domains.getTldList",
    SetContact = "namecheap.domains.setContacts",
    Check = "namecheap.domains.check",
}