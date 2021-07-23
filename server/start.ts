import { serve } from "https://deno.land/std@0.100.0/http/server.ts";
import { SocketStore } from "./socket-store.ts";
import { proxyWebSockets } from "./websocket-proxy.ts";
import { makeMatches } from "./matchmaker.ts";
import { identify } from "./identify.ts";

const server = serve({ port: 8000 });
const proxies = new SocketStore();
const matches = new SocketStore();

console.log("Listening on http://localhost:8000");

for await (const request of server) {
  proxyWebSockets(request, proxies) ||
    makeMatches(request, matches) ||
    identify(request);
}
