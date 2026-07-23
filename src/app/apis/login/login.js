import { api } from "../baseurl/baseurl";

// Logs in a vendor/admin user through the backend user API.
export const loginUser = (userData) => {
  return api.post("/users/login", userData);
};
