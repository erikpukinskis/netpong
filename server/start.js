import { serve } from "https://deno.land/std/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std/ws/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

const requests = serve({ port: 8000 });

const sockets = new Map();

console.log("Listening on http://localhost:8000");

for await (const request of requests) {
  const { conn, r: bufReader, w: bufWriter, headers } = request;

  if (request.headers.get("upgrade") === "websocket") {
    acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    }).then(handleWebSocketConnection);
  } else {
    request.respond({ body: "Hello World\n" });
  }
}

async function handleWebSocketConnection(socket) {
  const uuid = v4.generate();
  sockets.set(uuid, socket);
  console.log("socket connected");

  for await (const event of socket) {
    if (isWebSocketCloseEvent(event)) {
      sockets.delete(uuid);
      return;
    }
    if (event === "ping") {
      console.log(event);
      socket.send("pong!");
    }
  }
}
