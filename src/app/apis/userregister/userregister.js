import { api } from "../baseurl/baseurl";
import { extractCustomerId } from "../customer/customer";

// Registers an end customer and stores the returned customer id locally.
export const userRegister = async (data) => {
  const res = await api.post("/endusers/endregister", data);

  const userId = extractCustomerId(res.data);
  if (typeof window !== "undefined" && userId) {
    localStorage.setItem("cid", userId);
  }

  return res;
};
