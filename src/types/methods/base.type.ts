/**
 * Represents the result status of an operation.
 *
 * The `Status` type is a string union type that can take one of the following
 * values:
 * - "OK": Indicates the operation was successful.
 * - "ERROR": Indicates the operation encountered an error.
 */
export type Status = "OK" | "ERROR";

/**
 * Interface representing the base structure of a parsed XML response from Namecheap.
 * This interface includes metadata and other relevant properties extracted from
 * the Namecheap API's XML response.
 *
 * Properties:
 * - warnings: An object containing potential warnings from the API. The exact structure
 *   and type of this property are currently unknown and need further clarification.
 * - requestedCommand: A string representing the API command that was requested.
 * - server: A string indicating the server name or identifier responsible for processing
 *   the command.
 * - gmtTimeDifference: A string showing the time difference between GMT and the server's
 *   local time.
 * - executionTime: A number indicating the time taken (in seconds) to execute the API command.
 * - status: The status of the response, which is represented by the `Status` type.
 * - xmlns: A string representing the XML namespace associated with the response document.
 */
export interface NamecheapXMLParsedBase {
    warnings: object; // TODO: I don't know the type of this.
    requestedCommand: string;
    server: string;
    gmtTimeDifference: string;
    executionTime: number;
    status: Status;
    xmlns: string;
}

/**
 * Represents the parsed successful response structure of a Namecheap API XML response.
 *
 * This interface extends the base Namecheap XML parsed response structure
 * and includes additional information specific to successful responses.
 *
 * @template T - The type of the payload within the command response.
 *
 * @extends NamecheapXMLParsedBase
 *
 * @property {NamecheapCommandResponse<T>} commandResponse - The command-specific response payload provided by the Namecheap API.
 */
export interface NamecheapXMLParsedSuccess<T> extends NamecheapXMLParsedBase {
    commandResponse: NamecheapCommandResponse<T>;
}

/**
 * Represents the structure for a failed response parsed from Namecheap's XML API.
 * This interface extends from `NamecheapXMLParsedBase` while adding properties
 * specific to unsuccessful API responses.
 *
 * The `errors` property contains details about the error, including a descriptive
 * message (`value`) and a corresponding error number (`number`).
 *
 * Typically used for handling and identifying failure responses from Namecheap's API.
 */
export interface NamecheapXMLParsedFail extends NamecheapXMLParsedBase {
    errors: {
        value: string;
        number: number;
    }
}

/**
 * Represents the pagination details for a dataset.
 *
 * @interface Paging
 * @property {number} totalItem - The total number of items in the dataset.
 * @property {number} currentPage - The current page being accessed.
 * @property {number} pageSize - The number of items displayed per page.
 * @property {boolean} paging - Indicates whether paging is enabled.
 */
export interface Paging {
    totalItem: number;
    currentPage: number;
    pageSize: number;
    paging: boolean;
}

/**
 * Represents a response from a Namecheap API command.
 * Combines a generic type `T` with an additional `type` property
 * that indicates the response type.
 *
 * @template T The specific structure or data type of the API response.
 * @property {string} type The type of the response, describing its context or purpose.
 */
export type NamecheapCommandResponse<T> = T & {
    type: string;
}