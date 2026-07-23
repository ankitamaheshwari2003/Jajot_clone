import { api } from "../baseurl/baseurl";

// Fetches all product categories from the backend category API.
export const getCategories = () => {
  return api.get("/categories");
};
