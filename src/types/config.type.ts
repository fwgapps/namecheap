/**
 * The ConfigType interface defines the structure for configuration data used in an application.
 * This could include API credentials, client information, and other optional settings.
 *
 * Properties:
 * - `apiUser`: A string representing the user identifier for API authentication.
 * - `apiKey`: A string containing the authentication key required for API access.
 * - `clientIp`: A string representing the IP address of the client or user making requests.
 * - `sandbox`: A boolean indicating whether the application is running in a sandbox (testing) environment.
 * - `username` (optional): A string specifying the username for additional authentication purposes.
 */
export interface ConfigType {
  apiUser: string;
  apiKey: string;
  clientIp: string;
  sandbox: boolean;
  username?: string;
}

/**
 * Interface representing configuration properties for interacting with the Namecheap API.
 *
 * The properties in this interface are used to authenticate and establish a connection
 * with the Namecheap API, and they include credentials and endpoint details.
 *
 * Properties:
 *   - apiUser: The API user associated with the Namecheap account.
 *   - apiKey: The API key used for authenticating API requests.
 *   - clientIp: The client's IP address allowed to communicate with the API.
 *   - apiUrl: The base URL of the Namecheap API endpoint.
 *   - username: The username of the Namecheap account owner.
 */
export interface NamecheapProps {
  apiUser: string;
  apiKey: string;
  clientIp: string;
  apiUrl: string;
  username: string;
}
