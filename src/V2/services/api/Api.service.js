import { httpClient } from "./httpClient";

const unwrap = (request) => request.then((response) => response.data);

export const apiService = {
  get: (url, config) => unwrap(httpClient.get(url, config)),
  post: (url, data, config) => unwrap(httpClient.post(url, data, config)),
  put: (url, data, config) => unwrap(httpClient.put(url, data, config)),
  patch: (url, data, config) => unwrap(httpClient.patch(url, data, config)),
  delete: (url, config) => unwrap(httpClient.delete(url, config)),
};
