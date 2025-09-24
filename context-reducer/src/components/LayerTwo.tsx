import React from "react";
import LayerThree from "./LayerThree";

function LayerTwo() {
  console.log("2️⃣ LayerTwo rendered (should NOT re-render on context changes)");

  return (
    <div style={{ padding: "20px", border: "3px solid blue", margin: "10px" }}>
      <h2>Layer Two (No Context)</h2>
      <p>This layer does NOT consume context</p>
      <p>
        <strong>Expected:</strong> Should NOT re-render when context changes
      </p>

      <LayerThree />
    </div>
  );
}

export default LayerTwo;