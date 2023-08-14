import { configureStore } from "@reduxjs/toolkit";

import { medicationsApi } from "./medicationsApi";

export const store = configureStore({
  reducer: {
    [medicationsApi.reducerPath]: medicationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(medicationsApi.middleware),
});
