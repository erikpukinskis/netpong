import React, { useEffect, useState, useContext } from "react";
import {
  ProxyProtocol,
  MatchmakerProtocol,
} from "../lib/websocket-protocols.ts";

const OpponentContext = React.createContext();

export function OpponentProvider({ children }) {
  const [socket, setSocket] = useState();
  useEffect(async () => {
    const response = await fetch("/identity", { method: "post" });
    const { id } = await response.json();
    console.log("Identifying as", id);

    const match = new WebSocket(
      `ws://${location.host}`,
      MatchmakerProtocol(id)
    );

    match.onmessage = ({ data: opponentId }) => {
      const proxy = new WebSocket(
        `ws://${location.host}`,
        ProxyProtocol(id, opponentId)
      );
      setSocket(proxy);
    };
  }, []);
  return (
    <OpponentContext.Provider value={socket}>
      {children}
    </OpponentContext.Provider>
  );
}

export function useOpponentSocket() {
  return useContext(OpponentContext);
}
