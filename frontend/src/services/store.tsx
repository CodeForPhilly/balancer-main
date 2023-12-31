import { applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import rootReducer from "./reducers";
import { legacy_createStore as createStore } from "redux";

const initialState = {};

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;

// import { configureStore } from "@reduxjs/toolkit";
// import { medicationsApi } from "./medicationsApi";

// export const store = configureStore({
//   reducer: {
//     [medicationsApi.reducerPath]: medicationsApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(medicationsApi.middleware),
// });

// export default store;
