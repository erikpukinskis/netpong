import React from "react";
import ReactDOM from "react-dom";
// import { Table } from "./scenes/table";
// import { SceneProvider } from "./scenes/useScene";
import { OpponentProvider } from "./network";
import { Chat } from "./chat";

ReactDOM.render(
  <OpponentProvider>
    <Chat />
  </OpponentProvider>,
  document.getElementById("root")
);
