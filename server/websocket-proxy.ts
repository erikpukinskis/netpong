import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "https://deno.land/std@0.100.0/ws/mod.ts";
import { ServerRequest } from "https://deno.land/std@0.100.0/http/server.ts";
import { v4 } from "https://deno.land/std@0.100.0/uuid/mod.ts";
import * as Colors from "https://deno.land/std@0.100.0/fmt/colors.ts";
import { parseProxyProtocol } from "../lib/websocket-protocols.ts";

export function proxyWebSockets(request: ServerRequest, clients: SocketStore) {
  if (request.headers.get("upgrade") === "websocket") {
    openConnection(request, clients);
    return true;
  }
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

async function openConnection(request: ServerRequest, sockets: SocketStore) {
  const { callerId, listenerId } = parseProxyProtocol(
    request.headers.get("sec-websocket-protocol")
  );

  const { conn, r: bufReader, w: bufWriter, headers } = request;

  const socket = await acceptWebSocket({
    conn,
    bufReader,
    bufWriter,
    headers,
  });

  console.log(
    `${Colors.cyan("  [open]")} ${loggable(
      callerId
    )} has a socket open to talk to ${loggable(listenerId)}`
  );

  sockets.set(callerId, socket);

  const caller = loggable(callerId, true);
  const listener = loggable(listenerId, true);

  const messages = popQueuedMessages({ from: listenerId, to: callerId });
  console.log(
    `${Colors.cyan("  [dequeue]")} ${loggable(
      messages.length
    )} queued messages being sent from ${listener} to ${caller}`
  );
  for (const message of messages) {
    socket.send(message);
  }

  for await (const event of socket) {
    const listenerSocket = sockets.get(listenerId);

    if (!listenerSocket) {
      queueMessage({ from: callerId, to: listenerId }, event.toString());
      console.log(
        `${Colors.cyan("  [queued]")} message ${loggable(
          `"${event}"`
        )} from ${caller} for ${listener} when they connect`
      );
      return;
    }

    if (isWebSocketCloseEvent(event)) {
      sockets.close(callerId);
      console.log(`${Colors.cyan("  [bye]")} ${caller} hung up on ${listener}`);
      break;
    }

    console.log(
      `${Colors.cyan("  [message]")} ${caller} is sending ${loggable(
        `"${event}"`
      )} to listener ${listener}`
    );
    listenerSocket.send(event.toString());
  }

  console.log(
    `${Colors.cyan(
      "  [close]"
    )} Done with ${caller}'s connection to ${listener}`
  );
}

function loggable(text: string | number, shorten = false) {
  if (typeof text === "number" || !shorten) return Colors.gray(text.toString());
  return Colors.gray(text.split("-")[0].slice(0, 4));
}

export class SocketStore {
  sockets: Record<string, WebSocket> = {};
  issueId() {
    return v4.generate();
  }
  closeAll() {
    return new Promise<void>((resolve) => {
      for (const id in this.sockets) {
        this.sockets[id].close();
      }
      this.sockets = {};
      setTimeout(resolve);
    });
  }
  set(id: string, socket: WebSocket) {
    this.sockets[id] = socket;
  }
  get(id: string) {
    return this.sockets[id];
  }
  close(id: string) {
    delete this.sockets[id];
  }
}
