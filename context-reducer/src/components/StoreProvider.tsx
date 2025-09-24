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