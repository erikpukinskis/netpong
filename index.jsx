import React from "react";
import ReactDOM from "react-dom";
import { Table } from "./scenes/table";
import { SceneProvider } from "./scenes/useScene";

ReactDOM.render(
  <SceneProvider>
    <Table />
  </SceneProvider>,
  document.getElementById("root")
);
