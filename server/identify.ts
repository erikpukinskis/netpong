import { ServerRequest } from "https://deno.land/std@0.100.0/http/server.ts";
import { v4 } from "https://deno.land/std@0.100.0/uuid/mod.ts";

export function identify(request: ServerRequest) {
  console.log("identify!");
  debugger;
  if (!/^\/identity$/.test(request.url) || request.method !== "POST") return;
  return request.respond({
    body: JSON.stringify({ id: v4.generate() }),
    headers: new Headers({ "content-type": "application/json" }),
  });
}
