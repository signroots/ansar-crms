import axios from "axios";

import { getAuthSession } from "../../shared/utils/authSession";
import { API_CONFIG } from "./Api.config";

const API_PREFIX = "/api";

const normalizePath = (url = "") => {
  if (!API_CONFIG.baseURL.endsWith(API_PREFIX)) {
    return url;
  }

  return url.startsWith(`${API_PREFIX}/`) ? url.slice(API_PREFIX.length) : url;
};

export const createHttpClient = (config = {}) => {
  const client = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
      "Content-Type": "application/json",
    },
    ...config,
  });

  client.interceptors.request.use((requestConfig) => {
    const { accessToken } = getAuthSession();

    if (accessToken) {
      requestConfig.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (requestConfig.url) {
      requestConfig.url = normalizePath(requestConfig.url);
    }

    return requestConfig;
  });

  return client;
};

export const httpClient = createHttpClient();
