# Context Re-rendering Test Specification

## Project Overview

Create a React application to verify that intermediate components (that don't consume Context) won't re-render when Context state changes, even in a deep component hierarchy.

## Setup Requirements

### 1. Initialize Project

```bash
npx create-react-app context-test
cd context-test
npm start
```

### 2. Project Structure

```
src/
├── App.js
├── components/
│   ├── StoreProvider.js
│   ├── LayerOne.js
│   ├── LayerTwo.js
│   ├── LayerThree.js
│   └── LayerFour.js
└── index.js
```

## Implementation Specification

### 1. Store Provider (`src/components/StoreProvider.js`)

```jsx
import React, { createContext, useContext, useReducer } from "react";

// Initial state
const initialState = {
  count: 0,
  message: "Hello World",
};

// Actions
const actions = {
  INCREMENT: "INCREMENT",
  UPDATE_MESSAGE: "UPDATE_MESSAGE",
};

// Reducer
function storeReducer(state, action) {
  switch (action.type) {
    case actions.INCREMENT:
      return { ...state, count: state.count + 1 };
    case actions.UPDATE_MESSAGE:
      return { ...state, message: action.payload };
    default:
      return state;
  }
}

// Context
const StoreContext = createContext();

// Provider component
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  console.log("🔄 StoreProvider re-rendered");

  const value = {
    state,
    dispatch,
    actions: {
      increment: () => dispatch({ type: actions.INCREMENT }),
      updateMessage: (message) =>
        dispatch({ type: actions.UPDATE_MESSAGE, payload: message }),
    },
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

// Custom hook
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}
```

### 2. Layer One - Root Component (`src/components/LayerOne.js`)

```jsx
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
```

### 3. Layer Two - No Context Usage (`src/components/LayerTwo.js`)

```jsx
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
```

### 4. Layer Three - No Context Usage (`src/components/LayerThree.js`)

```jsx
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
```

### 5. Layer Four - Context Consumer (`src/components/LayerFour.js`)

```jsx
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
```

### 6. Main App Component (`src/App.js`)

```jsx
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
```

## Test Scenarios & Expected Results

### Initial Load

**Expected Console Output:**

```
🚀 App component rendered
1️⃣ LayerOne rendered
🔄 StoreProvider re-rendered
2️⃣ LayerTwo rendered (should NOT re-render on context changes)
3️⃣ LayerThree rendered (should NOT re-render on context changes)
4️⃣ LayerFour rendered (consumes context - will re-render)
```

### Test 1: Click "Increment Count" Button

**Expected Console Output:**

```
🔄 StoreProvider re-rendered
4️⃣ LayerFour rendered (consumes context - will re-render)
```

**Key Verification Points:**

- ✅ StoreProvider re-renders (has useReducer)
- ✅ LayerFour re-renders (consumes context)
- ❌ LayerTwo should NOT appear in console
- ❌ LayerThree should NOT appear in console
- ❌ App should NOT appear in console

### Test 2: Click "Update Message" Button

**Expected Console Output:**

```
🔄 StoreProvider re-rendered
4️⃣ LayerFour rendered (consumes context - will re-render)
```

**Same verification points as Test 1**

### Test 3: Add Context Consumer to Layer Two

Modify `LayerTwo.js` to consume context:

```jsx
import { useStore } from "./StoreProvider";

function LayerTwo() {
  const { state } = useStore(); // Add this line
  console.log("2️⃣ LayerTwo rendered (now consumes context)");

  return (
    <div style={{ padding: "20px", border: "3px solid blue", margin: "10px" }}>
      <h2>Layer Two (Now with Context)</h2>
      <p>Count from context: {state.count}</p> {/* Add this line */}
      {/* rest of component */}
    </div>
  );
}
```

**After modification, clicking buttons should show:**

```
🔄 StoreProvider re-rendered
2️⃣ LayerTwo rendered (now consumes context)
4️⃣ LayerFour rendered (consumes context - will re-render)
```

## Performance Verification

### Adding React DevTools Profiler

1. Install React DevTools browser extension
2. Go to Profiler tab
3. Start recording
4. Click buttons
5. Stop recording
6. Verify only consuming components show up in flamegraph

### Adding Render Timestamps

Add timestamps to console logs for precise timing:

```jsx
console.log(`🔄 StoreProvider re-rendered at ${new Date().toISOString()}`);
```

## Success Criteria

✅ **Pass Criteria:**

- Intermediate layers (LayerTwo, LayerThree) do NOT re-render when context changes
- Only Provider and consuming components re-render
- Console output matches expected patterns
- React DevTools Profiler shows minimal re-renders

❌ **Fail Criteria:**

- All layers re-render on every context change
- Non-consuming components appear in console logs
- Performance is similar to prop-drilling approach

## Additional Experiments

### Experiment 1: Compare with Prop Drilling

Create a parallel implementation using prop drilling and compare console outputs.

### Experiment 2: Mixed Context Usage

Have LayerTwo consume only part of the context (e.g., just actions, not state).

### Experiment 3: Multiple Contexts

Split state into multiple contexts and verify selective re-rendering.

## Troubleshooting

**If all components re-render:**

- Check that intermediate components don't accidentally consume context
- Verify StoreProvider is wrapping the right components
- Make sure you're not passing context value as props

**If context is undefined:**

- Ensure components are wrapped in StoreProvider
- Check useStore hook implementation
- Verify Context is exported correctly

## Conclusion

This test will definitively prove that React Context bypasses intermediate components that don't consume it, making it much more performant than traditional prop drilling in deep component trees.
