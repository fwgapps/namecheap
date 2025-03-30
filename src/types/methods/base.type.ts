export type Status = "OK" | "ERROR";

export interface NamecheapXMLParsedBase {
    warnings: object; // TODO: I don't know the type of this.
    requestedCommand: string;
    server: string;
    gmtTimeDifference: string;
    executionTime: number;
    status: Status;
    xmlns: string;
}

export interface NamecheapXMLParsedSuccess<T> extends NamecheapXMLParsedBase {
    commandResponse: NamecheapCommandResponse<T>;
}

export interface NamecheapXMLParsedFail extends NamecheapXMLParsedBase {
    errors: {
        value: string;
        number: number;
    }
}

export interface Paging {
    totalItem: number;
    currentPage: number;
    pageSize: number;
    paging: boolean;
}

export type NamecheapCommandResponse<T> = T & {
    type: string;
}