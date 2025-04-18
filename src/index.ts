import {ConfigType, type NamecheapProps} from "./types/config.type";
import {getNamecheapHost} from "./utils/service";
import {Domains} from "./methods/domains";

export default class Namecheap {
    private readonly apiUrl: string;
    private readonly apiUser: string;
    private readonly apiKey: string;
    private readonly username: string;
    private readonly clientIp: string;

    public readonly domains: Domains;

    constructor(
        config: ConfigType
    ) {
        const {apiUser, apiKey, username, clientIp, sandbox} = config;

        this.apiUser = apiUser;
        this.apiKey = apiKey;
        this.username = username || apiUser;
        this.clientIp = clientIp;
        this.apiUrl = getNamecheapHost(sandbox);

        this.domains = new Domains(this.getConfig());

    }

    private getConfig(): NamecheapProps {
        return {
            apiUser: this.apiUser,
            apiKey: this.apiKey,
            username: this.username,
            clientIp: this.clientIp,
            apiUrl: this.apiUrl
        }
    }
}