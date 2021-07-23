import React, { useState, useEffect } from "react";
import { useOpponentSocket } from "./network";

export function Chat() {
  const socket = useOpponentSocket();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const append = ({ data }) => {
      setMessages([...messages, { from: "them", message: data }]);
    };
    socket.onmessage = append;
    return () => delete socket.onmessage;
  }, [socket, messages]);

  const send = () => {
    setMessages([...messages, { from: "us", message: text }]);
    setText(undefined);
    socket.send(text);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  return (
    <>
      {messages.map(({ from, message }) => (
        <p>
          <b>{from}:</b> {message}
        </p>
      ))}
      <input value={text} onChange={handleTextChange} />
      <button disabled={!socket} onClick={send}>
        Send
      </button>
    </>
  );
}
