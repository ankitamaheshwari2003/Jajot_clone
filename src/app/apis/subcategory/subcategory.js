import { api } from "../baseurl/baseurl";

// Fetches all product subcategories from the backend subcategory API.
export const getSubCategories = () => {
  return api.get("/subcategories");
};
