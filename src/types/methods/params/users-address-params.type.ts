export interface CreateUserAddressParams {
    addressName: string
    defaultYN?: number
    emailAddress: string
    firstName: string
    lastName: string
    jobTitle?: string
    organization?: string
    address1: string
    address2?: string
    city: string
    stateProvince: string
    stateProvinceChoice: string
    zip: string
    country: string
    phone: string
    phoneExt?: string
    fax?: string
}

export interface GetUserAddressInfoParam {
    addressId: number
}

export interface DeleteUserAddressParams {
    addressId: number
}

export interface SetDefaultUserAddressParams {
    addressId: number
}

export interface UpdateUserAddressParams extends CreateUserAddressParams{
    addressId: number
}