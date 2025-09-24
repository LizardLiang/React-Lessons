import React from "react";
import { StoreProvider } from "./StoreProvider";
import LayerTwo from "./LayerTwo";

function LayerOne() {
  console.log("1️⃣ LayerOne rendered");

  return (
    <div style={{ padding: "20px", border: "3px solid red", margin: "10px" }}>
      <h2>Layer One (Root with Provider)</h2>
      <p>This layer contains the StoreProvider</p>

      <StoreProvider>
        <LayerTwo />
      </StoreProvider>
    </div>
  );
}

export default LayerOne;