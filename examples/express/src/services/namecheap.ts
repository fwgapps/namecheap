import dotenv from "dotenv";
import Namecheap from "@fwgapps/namecheap";

dotenv.config();

const apiUser = process.env.API_USER || "";
const apiKey = process.env.API_KEY || "";
const clientIp = process.env.CLIENT_IP || "";
const sandbox = process.env.ENV !== "PRODUCTION";

if (!apiUser || !apiKey || !clientIp) {
  throw new Error("Please provide a valid namecheap config");
}

const namecheap = new Namecheap({
  apiUser,
  apiKey,
  clientIp,
  sandbox,
});

export default namecheap;
