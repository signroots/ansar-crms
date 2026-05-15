import { apiService } from "../Api.service";

export const authApi = {
  login: (payload) => apiService.post("/login/", payload),
  adminLogin: (payload) => apiService.post("/adminlogin/", payload),
  userLogin: (payload) => apiService.post("/userlogin/", payload),
  validateToken: () => apiService.get("/validate-token/"),
};
