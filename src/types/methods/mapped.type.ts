import {CommandsDomain} from "../../utils/commands";
import {CreateSuccess, GetContactSuccess, GetListSuccess, GetTldListSuccess, SetContactSuccess, CheckSuccess} from "./domains.type";
import {ContactDomain, CreateDomain, EmptyParams, GetContactParams} from "./params.type";

export interface MappedDomain {
    [CommandsDomain.GetList]: GetListSuccess
    [CommandsDomain.GetContact]: GetContactSuccess
    [CommandsDomain.Create]: CreateSuccess
    [CommandsDomain.GetTldList]: GetTldListSuccess
    [CommandsDomain.SetContact]: SetContactSuccess
    [CommandsDomain.Check]: CheckSuccess
}

export type NamecheapParamsMap = {
    [CommandsDomain.GetList]: EmptyParams
    [CommandsDomain.GetContact]: GetContactParams
    [CommandsDomain.Create]: CreateDomain
    [CommandsDomain.GetTldList]: EmptyParams
    [CommandsDomain.SetContact]: ContactDomain
    [CommandsDomain.Check]: EmptyParams
}