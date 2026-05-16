const trimTrailingSlash = (value) => value?.replace(/\/+$/, "");

export const env = {
  appEnv: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
  apiUrl: "https://it.ansar.in/api",
  wsUrl: trimTrailingSlash(import.meta.env.VITE_WS_URL) || "ws://127.0.0.1:8001",
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};
