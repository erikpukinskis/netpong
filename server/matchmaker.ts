import {
  isMatchmakerProtocol,
  parseMatchmakerProtocol,
} from "../lib/websocket-protocols.ts";
import { SocketStore } from "./socket-store.ts";
import { ServerRequest } from "https://deno.land/std@0.100.0/http/server.ts";
import { acceptWebSocket } from "https://deno.land/std@0.100.0/ws/mod.ts";
import { log, datum } from "./log.ts";

// Todo: If a client closes the socket, remove them from the socket store

export function makeMatches(request: ServerRequest, clients: SocketStore) {
  if (request.headers.get("upgrade") !== "websocket") return;
  if (!isMatchmakerProtocol(request.headers.get("sec-websocket-protocol")))
    return;
  openConnection(request, clients);
  return true;
}

async function openConnection(request: ServerRequest, clients: SocketStore) {
  const { callerId } = parseMatchmakerProtocol(
    request.headers.get("sec-websocket-protocol")
  );

  const { conn, r: bufReader, w: bufWriter, headers } = request;

  const socket = await acceptWebSocket({
    conn,
    bufReader,
    bufWriter,
    headers,
  });

  if (clients.ids().includes(callerId)) {
    throw new Error(`${callerId} is already waiting for a match`);
  }

  const opponentId = clients.ids()[0];
  if (opponentId) {
    const opponentSocket = clients.get(opponentId);
    opponentSocket.send(callerId);
    clients.close(opponentId);
    socket.send(opponentId);
    socket.close();
    log.event(
      "match",
      "matching",
      datum(opponentId, { shorten: true }),
      "with",
      datum(callerId)
    );
  } else {
    log.event("wait", datum(callerId), "is requesting a match");

    clients.set(callerId, socket);
  }
}
