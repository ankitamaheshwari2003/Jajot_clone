import axios from "axios";
import { extractCustomerId } from "../customer/customer";

const BASE_URL = "https://amazon-multi-vendor-3.onrender.com/api/endusers";

export const userRegister = async (data) => {
  const res = await axios.post(`${BASE_URL}/endregister`, data);

  const userId = extractCustomerId(res.data);
  if (typeof window !== "undefined" && userId) {
    localStorage.setItem("cid", userId);
  }

  return res;
};
