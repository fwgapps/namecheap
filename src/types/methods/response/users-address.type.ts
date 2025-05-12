export interface AddressCreateResult {
    success: boolean,
    addressId: number,
    addressName: string
}


export interface AddressCreateBaseResult {
    addressCreateResult: AddressCreateResult
}

export interface AddressDeleteResult {
    success: boolean,
    profileId: number,
    userName: string
}

export interface AddressDeleteBaseResult {
    addressDeleteResult: AddressDeleteResult
}

export interface GetAddressInfoResult {
    addressId: number,
    userName: string,
    addressName: string,
    defaultYn: boolean,
    firstName: string,
    lastName: string,
    jobTitle: string,
    organization: string,
    address1: string,
    address2: string,
    city: string,
    stateProvince: string,
    stateProvinceChoice: string,
    zip: number,
    country: string,
    phone: number,
    fax: number,
    phoneExt: number,
    emailAddress: string,
    getAddressInfoResult: boolean
}

export interface GetAddressInfoBaseResult {
    getAddressInfoResult: GetAddressInfoResult
}

export interface AddressGetListResult {
    addressId: number,
    addressName: string
}

export interface AddressGetListBaseResult {
    addressGetListResult: AddressGetListResult
}

export interface AddressSetDefaultBaseResult {
    addressSetDefaultResult: number
}

export interface AddressUpdateResult {
    success: boolean,
    addressId: number,
    addressName: string
}

export interface AddressUpdateBaseResult {
    addressUpdateResult: AddressUpdateResult
}