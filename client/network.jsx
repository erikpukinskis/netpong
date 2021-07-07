import React, { useEffect, useState, useContext, useRef } from "react";

const OpponentContext = React.createContext();

export function useSocket(handleMessage) {
  const { send, listen } = useContext(OpponentContext);
  useEffect(() => {
    if (!handleMessage) return;
    listen(handleMessage);
  }, []);
  return { send };
}

export function OpponentProvider({ children }) {
  const [socket, setSocket] = useState(new WebSocket("ws://localhost:8080/ws"));

  const sendQueue = useRef([]);
  const listeners = useRef([]);

  function send(message) {
    if ([socket.CLOSED, socket.CLOSING].includes(socket.readyState)) {
      throw new Error("Socket was closed");
    }

    if (socket.readyState === socket.CONNECTING) {
      sendQueue.current.push(message);
      return;
    }
    socket.send(message);
  }

  function listen(handleMessage) {
    listeners.current.push(handleMessage);
  }

  useEffect(
    function openWebSocket() {
      if (typeof socket === "boolean") return;
      socket.onclose = () => {
        setSocket(true);
        const unsentCount = sendQueue.current.length;
        if (unsentCount > 0) {
          throw new Error(`Socket closed with ${unsentCount} unsent messages`);
        }
      };
      socket.onopen = () => {
        setSocket(socket);
        for (const message in sendQueue.current) {
          send(message);
        }
        sendQueue.current = [];
      };
      socket.onmessage = ({ data }) => {
        for (const handleMessage of listeners.current) {
          handleMessage(data);
        }
      };
    },
    [socket]
  );

  return (
    <OpponentContext.Provider value={{ send, listen }}>
      {children}
    </OpponentContext.Provider>
  );
}
