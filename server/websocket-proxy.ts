import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "https://deno.land/std@0.100.0/ws/mod.ts";
import { ServerRequest } from "https://deno.land/std@0.100.0/http/server.ts";
import { v4 } from "https://deno.land/std@0.100.0/uuid/mod.ts";

function getCallId(id: string, otherId: string) {
  if (id < otherId) {
    return `${id}⇌${otherId}`;
  } else {
    return `${otherId}⇌${id}`;
  }
}

export class SocketStore {
  callSockets: Record<string, Record<string, WebSocket>> = {};
  issueId() {
    return v4.generate();
  }
  closeAll() {
    return new Promise<void>((resolve) => {
      for (const callId in this.callSockets) {
        const socketsByCallerId = this.callSockets[callId];
        for (const callerId in socketsByCallerId) {
          const socket = socketsByCallerId[callerId];
          // This seems not to be instantaneous, so we wait a tick before resolving below
          socket.close();
        }
      }
      setTimeout(resolve);
    });
  }
  startCall(callerId: string, listenerId: string, socket: WebSocket) {
    const callId = getCallId(callerId, listenerId);

    let sockets = this.callSockets[callId];
    if (!sockets) {
      sockets = this.callSockets[callId] = {
        [callerId]: socket,
      };
    }
    sockets[callerId] = socket;
    return callId;
  }
  endCall(callId: string, callerId: string) {
    delete this.callSockets[callId][callerId];
  }
  getListenerSocket(callId: string, listenerId: string) {
    if (!this.callSockets[callId]) {
      const calls = Object.keys(this.callSockets);
      const whatsBeenRegistered =
        calls.join() +
        (calls.length === 0
          ? "No calls have."
          : calls.length === 1
          ? " has."
          : " have.");

      throw new Error(
        `Call ${callId} has not been registered. ${whatsBeenRegistered}`
      );
    }
    return this.callSockets[callId][listenerId];
  }
}

export async function proxyWebSockets(
  request: ServerRequest,
  clients: SocketStore
) {
  if (request.headers.get("upgrade") === "websocket") {
    openConnection(request, clients);
  }
}

export function ProxyProtocol(registerAsId: string, subscribeToId: string) {
  return `proxy--${registerAsId}--${subscribeToId}`;
}

const UUID_FORMAT = /^[0-9a-f]+-[0-9a-f]+-[0-9a-f]+-[0-9a-f]+-[0-9a-f]+$/;

function parseProxyProtocol(protocol: string | null) {
  if (typeof protocol !== "string") {
    throw new Error(
      `Cannot parse ${protocol} as ProxyProtocol because it is not a string. Try using ProxyProtocol() to generate the protocol.`
    );
  }
  const match = protocol.match(/^proxy--(.+)--(.+)$/);
  if (!match) {
    throw new Error(
      `Cannot parse ${protocol} as ProxyProtocol because it does not match the format "proxy--[UUID]--[UUID]". Try using ProxyProtocol() to generate the protocol.`
    );
  }
  const [_, callerId, listenerId] = match;

  if (!UUID_FORMAT.test(callerId)) {
    throw new Error(
      `Cannot parse ${protocol} as ProxyProtocol because the first id isn't a UUID. Try using ProxyProtocol() to generate the protocol.`
    );
  }

  if (!UUID_FORMAT.test(listenerId)) {
    throw new Error(
      `Cannot parse ${protocol} as ProxyProtocol because the second id isn't a UUID. Try using ProxyProtocol() to generate the protocol.`
    );
  }

  return { callerId, listenerId };
}

async function openConnection(request: ServerRequest, clients: SocketStore) {
  console.log("connecting new socket");

  const { conn, r: bufReader, w: bufWriter, headers } = request;

  const socket = await acceptWebSocket({
    conn,
    bufReader,
    bufWriter,
    headers,
  });

  const { callerId, listenerId } = parseProxyProtocol(
    request.headers.get("sec-websocket-protocol")
  );

  const callId = clients.startCall(callerId, listenerId, socket);

  console.log(`${callerId} is calling ${listenerId} on call ${callId}`);

  for await (const event of socket) {
    if (isWebSocketCloseEvent(event)) {
      console.log(`${callerId} hung up on ${listenerId}`);
      clients.endCall(callId, callerId);
      break;
    }

    const listenerSocket = clients.getListenerSocket(callId, listenerId);

    if (!listenerSocket) {
      throw new Error(
        `Listener ${listenerId} is not currently listening to call ${callId}`
      );
    }
    console.log(
      `Caller ${callerId} is sending ${event} on call ${callId} to listener ${listenerId}`
    );
    listenerSocket.send(event.toString());
  }

  console.log(`Done with ${callerId} connection`);
}
