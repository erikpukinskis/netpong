import { WebSocket } from "https://deno.land/std@0.100.0/ws/mod.ts";

export class SocketStore {
  sockets: Record<string, WebSocket> = {};
  ids() {
    return Object.keys(this.sockets);
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
