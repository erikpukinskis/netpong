import React from "react";
import ReactDOM from "react-dom";
import { Table } from "./scenes/table";
import { SceneProvider } from "./scenes/useScene";
import { OpponentProvider } from "./network";

ReactDOM.render(
  <OpponentProvider>
    <SceneProvider>
      <Table />
    </SceneProvider>
  </OpponentProvider>,
  document.getElementById("root")
);
