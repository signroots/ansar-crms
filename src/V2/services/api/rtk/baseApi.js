import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_CONFIG } from "../Api.config";
import { getAuthSession } from "../../../shared/utils/authSession";

export const baseApi = createApi({
  reducerPath: "ansarApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.baseURL,
    prepareHeaders: (headers) => {
      const { accessToken } = getAuthSession();

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Auth", "Users", "Requests", "Complaints", "Dashboard"],
  endpoints: () => ({}),
});
