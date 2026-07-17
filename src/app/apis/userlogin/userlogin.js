import axios from "axios";

const BASE_URL = "https://amazon-multi-vendor-3.onrender.com/api/endusers";

export const userLogin = async (data) => {
  return axios.post(`${BASE_URL}/endlogin`, data);
};
