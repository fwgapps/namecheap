import {Status} from "../../types/response.type";

export interface ResponseFormatted<T> {
    status: Status;
    data: T;
}