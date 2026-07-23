import { api } from "../baseurl/baseurl";

// Logs in an end customer through the backend end-user API.
export const userLogin = async (data) => {
  return api.post("/endusers/endlogin", data);
};

// Fetches full end-user details by id (used to auto-fill address form).
export const getEndUserById = async (cid) => {
  return api.get(`/endusers/enduser/${cid}`);
};

// Updates end-user profile/address details on the backend.
export const updateEndUser = async (cid, data) => {
  return api.put(`/endusers/enduser/${cid}`, data);
};