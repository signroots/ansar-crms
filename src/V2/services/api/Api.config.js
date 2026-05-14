import { env } from "../../config/env";

export const API_CONFIG = {
  baseURL: env.apiUrl,
  timeout: 30000,
};
