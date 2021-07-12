import { assertEquals } from "https://deno.land/std@0.100.0/testing/asserts.ts";
import {
  serve,
  ServerRequest,
} from "https://deno.land/std@0.100.0/http/server.ts";
import {
  SocketStore,
  proxyWebSockets,
  ProxyProtocol,
} from "./websocket-proxy.ts";

Deno.test("server will proxy websocket from two clients", async () => {
  const clients = new SocketStore();
  const chefId = clients.issueId();
  const dinerId = clients.issueId();

  const diner = new WebSocket(
    "ws://localhost:8000/proxy",
    ProxyProtocol(dinerId, chefId)
  );
  const chef = new WebSocket(
    "ws://localhost:8000/proxy",
    ProxyProtocol(chefId, dinerId)
  );

  const server = serve({ port: 8000 });

  (async function () {
    for await (const request of server) {
      proxyWebSockets(request, clients);
    }

    console.log("end of async");
  })();

  diner.onopen = () => {
    console.log("Chefsocket ready!");

    // Send a message over the WebSocket to the server
    diner.send("my compliments!");
  };

  await new Promise<void>((resolve) => {
    chef.onmessage = ({ data }) => {
      assertEquals(data, "my compliments!");
      console.log("ok!");
      resolve();
    };
  });
  await clients.closeAll();
  server.close();

  console.log("ok really done");
});
