import { MatchmakerProtocol } from "../lib/websocket-protocols.ts";
import { SocketStore } from "./socket-store.ts";
import { serve } from "https://deno.land/std@0.100.0/http/server.ts";
import { makeMatches } from "./matchmaker.ts";
import { assertEquals } from "https://deno.land/std@0.100.0/testing/asserts.ts";

Deno.test("server can match up two players ", async () => {
  console.log();
  const clients = new SocketStore();
  const chefId = clients.issueId();
  const dinerId = clients.issueId();

  const server = serve({ port: 8000 });

  (async function () {
    for await (const request of server) {
      makeMatches(request, clients);
    }
  })();

  let chefMessage = "";
  let dinerMessage = "";

  await new Promise<void>((resolve) => {
    const diner = new WebSocket(
      "ws://localhost:8000",
      MatchmakerProtocol(dinerId)
    );

    function maybeResolve() {
      if (chefMessage && dinerMessage) setTimeout(resolve);
    }

    diner.onmessage = ({ data }) => {
      dinerMessage = data;
      maybeResolve();
    };

    const chef = new WebSocket(
      "ws://localhost:8000",
      MatchmakerProtocol(chefId)
    );

    chef.onmessage = ({ data }) => {
      chefMessage = data;
      maybeResolve();
    };
  });

  server.close();

  assertEquals(chefMessage, dinerId);
  assertEquals(dinerMessage, chefId);
});
