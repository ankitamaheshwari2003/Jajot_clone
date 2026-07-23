import { api } from "../baseurl/baseurl";

// Fetches all nested subcategory records from the backend API.
export const getSubToSubCategories = () => {
  return api.get("/subtosubcategories");
};
