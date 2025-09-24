import React from "react";
import { useStore } from "./StoreProvider";

function LayerFour() {
  const { state, actions } = useStore();

  console.log("4️⃣ LayerFour rendered (consumes context - will re-render)");

  return (
    <div
      style={{ padding: "20px", border: "3px solid purple", margin: "10px" }}
    >
      <h2>Layer Four (Context Consumer)</h2>
      <p>This layer consumes context</p>
      <p>
        <strong>Expected:</strong> Will re-render when context changes
      </p>

      <div style={{ marginTop: "20px" }}>
        <h3>Current State:</h3>
        <p>Count: {state.count}</p>
        <p>Message: {state.message}</p>

        <div style={{ marginTop: "10px" }}>
          <button
            onClick={actions.increment}
            style={{ marginRight: "10px", padding: "10px 20px" }}
          >
            Increment Count
          </button>

          <button
            onClick={() => actions.updateMessage(`Updated at ${Date.now()}`)}
            style={{ padding: "10px 20px" }}
          >
            Update Message
          </button>
        </div>
      </div>
    </div>
  );
}

export default LayerFour;