import dotenv from "dotenv";
import Namecheap from "@fwgapps/namecheap";

dotenv.config();

const { API_USER, API_KEY, CLIENT_IP, USER_NAME, ENV } = process.env;

const missing = [
  ["API_USER", API_USER],
  ["API_KEY", API_KEY],
  ["CLIENT_IP", CLIENT_IP],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  // Only the names are printed, never the values.
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const namecheap = new Namecheap({
  apiUser: API_USER as string,
  apiKey: API_KEY as string,
  clientIp: CLIENT_IP as string,
  ...(USER_NAME ? { userName: USER_NAME } : {}),
  // Sandbox unless ENV is exactly "PRODUCTION".
  sandbox: ENV !== "PRODUCTION",
  timeoutMs: 30000,
});

export default namecheap;
