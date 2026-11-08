import Namecheap from "../../src";

const {
  NAMECHEAP_API_USER: apiUser,
  NAMECHEAP_API_KEY: apiKey,
  NAMECHEAP_CLIENT_IP: clientIp,
} = process.env;

export const hasCredentials = Boolean(apiUser && apiKey && clientIp);

// HARD RULE: never run a password-checking command as the main account (the ApiUser from .env).
// A wrong password counts as a failed login and three in a row lock that ApiUser for 24 hours.
// These commands may only run with an explicit `userName` of the throw-away E2E account.
const PASSWORD_COMMANDS = /^namecheap\.users\.(login|changepassword|resetpassword)$/i;

let last = 0; // shared by every client, so two clients still respect the limit together
const throttledFetch: typeof fetch = async (input, init) => {
  const body = new URLSearchParams(String(init?.body));
  const command = body.get("Command") ?? "";
  if (PASSWORD_COMMANDS.test(command) && body.get("UserName") === body.get("ApiUser")) {
    throw new Error(`Refusing ${command} on the main account: pass the E2E account as userName`);
  }
  const wait = last + 3200 - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  last = Date.now();
  return fetch(input, init);
};

/**
 * A client pointed at the SANDBOX (hardcoded: the E2E suites must never reach production).
 * Calls are spaced out because the API allows 20 calls per minute (700 per hour); run the suites one file at a time
 * (`npm run test:e2e` already does). `userName` makes the client act on another account
 * (the throw-away E2E account).
 */
export function createSandboxClient(userName?: string): Namecheap {
  return new Namecheap({
    apiUser: apiUser ?? "",
    apiKey: apiKey ?? "",
    clientIp: clientIp ?? "",
    sandbox: true,
    fetch: throttledFetch,
    ...(userName === undefined ? {} : { userName }),
  });
}
