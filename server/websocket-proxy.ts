import {
  acceptWebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.100.0/ws/mod.ts";
import { ServerRequest } from "https://deno.land/std@0.100.0/http/server.ts";
import * as Colors from "https://deno.land/std@0.100.0/fmt/colors.ts";
import {
  isProxyProtocol,
  parseProxyProtocol,
} from "../lib/websocket-protocols.ts";
import { SocketStore } from "./socket-store.ts";
export { SocketStore } from "./socket-store.ts";
import { log, datum } from "./log.ts";

export function proxyWebSockets(request: ServerRequest, clients: SocketStore) {
  if (request.headers.get("upgrade") !== "websocket") return;
  const protocol = request.headers.get("sec-websocket-protocol");
  if (!isProxyProtocol(protocol)) return;
  openConnection(request, clients, protocol);
  return true;
}

const queuedMessages: Record<string, Record<string, string[]>> = {};

function queueMessage(
  { from, to }: { from: string; to: string },
  message: string
) {
  if (!queuedMessages[from]) {
    queuedMessages[from] = {};
  }
  if (!queuedMessages[from][to]) {
    queuedMessages[from][to] = [];
  }
  queuedMessages[from][to].push(message);
}

function popQueuedMessages({ from, to }: { from: string; to: string }) {
  if (!queuedMessages[from]) return [];
  if (!queuedMessages[from][to]) return [];
  const messages = queuedMessages[from][to];
  delete queuedMessages[from][to];
  if (Object.keys(queuedMessages[from]).length < 1) {
    delete queuedMessages[from];
  }
  return messages;
}

async function openConnection(
  request: ServerRequest,
  sockets: SocketStore,
  protocol: string
) {
  const { callerId, listenerId } = parseProxyProtocol(protocol);

  const { conn, r: bufReader, w: bufWriter, headers } = request;

  const socket = await acceptWebSocket({
    conn,
    bufReader,
    bufWriter,
    headers,
  });

  log.event(
    "open",
    datum(callerId),
    "has a socket open to talk to",
    datum(listenerId)
  );

  sockets.set(callerId, socket);

  const caller = datum(callerId, { shorten: true });
  const listener = datum(listenerId, { shorten: true });

  const messages = popQueuedMessages({ from: listenerId, to: callerId });

  log.event(
    "dequeue",
    datum(messages.length),
    "queued messages being sent from",
    listener,
    "to",
    caller
  );

  for (const message of messages) {
    socket.send(message);
  }

  for await (const event of socket) {
    const listenerSocket = sockets.get(listenerId);

    if (!listenerSocket) {
      queueMessage({ from: callerId, to: listenerId }, event.toString());
      log.event(
        "queued",
        "message",
        datum(event, { stringify: true }),
        "from",
        caller,
        "for",
        listener,
        "when they connect"
      );

      return;
    }

    if (isWebSocketCloseEvent(event)) {
      sockets.close(callerId);
      console.log(`${Colors.cyan("  [bye]")} ${caller} hung up on ${listener}`);
      break;
    }

    log.event(
      "message",
      caller,
      "is sending",
      datum(event, { stringify: true }),
      "to listener",
      listener
    );
    listenerSocket.send(event.toString());
  }

  log.event("close", "Done with", caller, "connection to", listener);
}
