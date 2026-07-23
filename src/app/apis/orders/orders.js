import { api } from "../baseurl/baseurl";

// Fetches all orders for one customer from the backend orders API.
export const getUserOrders = (userId) => {
  return api.get(`/orders/user/${userId}`);
};


// Places a checkout order through the backend orders API.
export const placeOrder = (data) => {
  return api.post("/orders/place-order", data);
};


// Creates a return request for an order item through the backend orders API.
export const returnOrder = (data) => {
  return api.post("/orders/return", data);
};
