import { api } from "../baseurl/baseurl";

export const getUserOrders = (userId) => {
  return api.get(`/orders/user/${userId}`);
};


export const placeOrder = (data) => {
  return api.post("/orders/place-order", data);
};


export const returnOrder = (data) => {
  return api.post("/orders/return", data);
};
