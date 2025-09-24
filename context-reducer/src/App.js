import React from "react";
import LayerOne from "./components/LayerOne";

function App() {
  console.log("🚀 App component rendered");

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>
        Context Re-rendering Test
      </h1>
      <p style={{ textAlign: "center", color: "#666" }}>
        Open DevTools Console to see render logs
      </p>

      <LayerOne />
    </div>
  );
}

export default App;