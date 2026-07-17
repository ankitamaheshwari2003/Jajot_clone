import axios from "axios";

const BASE_URL =
process.env.NEXT_PUBLIC_API_BASE_URL ||
"https://amazon-multi-vendor-3.onrender.com/api";

export const getUserOrders = (userId) => {
  return axios.get(`${BASE_URL}/orders/user/${userId}`);
};


export const placeOrder = (data) => {
  return axios.post(`${BASE_URL}/orders/place-order`, data);
};


export const returnOrder = (data) => {
  return axios.post(`${BASE_URL}/orders/return`, data);
};
