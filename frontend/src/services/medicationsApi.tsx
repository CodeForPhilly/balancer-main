import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const medicationsApi = createApi({
  reducerPath: "medicationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://codeforphilly.github.io/balancer-data/api",
  }),
  endpoints: (builder) => ({
    getMedicationInfo: builder.query({
      // encodeURIComponent() function encodes special characters that may be present in the parameter values
      // If we do not properly encode these characters, they can be misinterpreted by the server and cause errors or unexpected behavior. Thus that RTK bug
      query: () => `/medications/index.json`,
    }),
  }),
});

export const { useLazyGetMedicationInfoQuery } = medicationsApi;
