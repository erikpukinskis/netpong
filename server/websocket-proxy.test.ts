import { assertEquals } from "https://deno.land/std@0.100.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.100.0/http/server.ts";
import { SocketStore, proxyWebSockets } from "./websocket-proxy.ts";
import { ProxyProtocol } from "../lib/websocket-protocols.ts";
import { v4 } from "https://deno.land/std@0.100.0/uuid/mod.ts";

Deno.test("server will proxy websocket from two clients", async () => {
  console.log();
  const clients = new SocketStore();
  const chefId = v4.generate();
  const dinerId = v4.generate();

  const server = serve({ port: 8000 });

  (async function () {
    for await (const request of server) {
      proxyWebSockets(request, clients);
    }
  })();

  const diner = new WebSocket(
    "ws://localhost:8000",
    ProxyProtocol(dinerId, chefId)
  );

  diner.onopen = () => {
    diner.send("my compliments!");
  };

  setTimeout(() => {
    const chef = new WebSocket(
      "ws://localhost:8000",
      ProxyProtocol(chefId, dinerId)
    );

    chef.onmessage = ({ data }) => {
      assertEquals(data, "my compliments!");
      chef.send("thank you");
    };
  });

  await new Promise<void>((resolve) => {
    diner.onmessage = ({ data }) => {
      assertEquals(data, "thank you");
      resolve();
    };
  });

  await clients.closeAll();
  server.close();
});
