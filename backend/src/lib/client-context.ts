import type { Request } from "express";
import { UAParser } from "ua-parser-js";

export function requestClientContext(request: Request) {
  const originalUserAgent = request.get("user-agent");
  const parsedUserAgent = new UAParser(originalUserAgent ?? "").getResult();
  const clientIp = (request.ip ?? request.socket.remoteAddress ?? "unknown").replace(/^::ffff:/, "");

  return {
    client: { address: clientIp, ip: clientIp },
    user_agent: {
      original: originalUserAgent,
      name: parsedUserAgent.browser.name ?? "Other",
      version: parsedUserAgent.browser.version,
      os: {
        name: parsedUserAgent.os.name ?? "Other",
        version: parsedUserAgent.os.version,
      },
    },
  };
}
