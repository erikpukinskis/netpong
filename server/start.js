import { serve } from "https://deno.land/std@0.100.0/http/server.ts";
import { SocketStore, proxyWebSockets } from "./websocket-proxy.ts";

const server = serve({ port: 8000 });
const clients = new SocketStore();

console.log("Listening on http://localhost:8000");

for await (const request of server) {
  proxyWebSockets(request, clients);
}
