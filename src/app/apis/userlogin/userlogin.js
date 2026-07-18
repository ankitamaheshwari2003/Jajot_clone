import { api } from "../baseurl/baseurl";

export const userLogin = async (data) => {
  return api.post("/endusers/endlogin", data);
};
