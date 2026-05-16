import axios from "axios";

import { clearAuthSession, getAuthSession } from "../../shared/utils/authSession";
import { API_CONFIG } from "./Api.config";

const API_PREFIX = "/api";
const AUTH_PATHS = new Set([
  "/login",
  "/admin/auth",
  "/user/user-login",
  "/tech-support/tech-support-login",
]);

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

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearAuthSession();

        if (typeof window !== "undefined" && !AUTH_PATHS.has(window.location.pathname)) {
          window.location.replace("/login");
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};

export const httpClient = createHttpClient();
