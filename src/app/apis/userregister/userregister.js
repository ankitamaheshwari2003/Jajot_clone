import { api } from "../baseurl/baseurl";
import { extractCustomerId } from "../customer/customer";

export const userRegister = async (data) => {
  const res = await api.post("/endusers/endregister", data);

  const userId = extractCustomerId(res.data);
  if (typeof window !== "undefined" && userId) {
    localStorage.setItem("cid", userId);
  }

  return res;
};
