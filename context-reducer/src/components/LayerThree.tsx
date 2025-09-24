import React from "react";
import LayerFour from "./LayerFour";

function LayerThree() {
  console.log(
    "3️⃣ LayerThree rendered (should NOT re-render on context changes)",
  );

  return (
    <div style={{ padding: "20px", border: "3px solid green", margin: "10px" }}>
      <h2>Layer Three (No Context)</h2>
      <p>This layer does NOT consume context</p>
      <p>
        <strong>Expected:</strong> Should NOT re-render when context changes
      </p>

      <LayerFour />
    </div>
  );
}

export default LayerThree;