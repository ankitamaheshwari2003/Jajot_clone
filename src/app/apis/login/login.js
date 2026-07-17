import { api } from "../baseurl/baseurl";

export const loginUser = (userData) => {
  return api.post("/users/login", userData);
};
