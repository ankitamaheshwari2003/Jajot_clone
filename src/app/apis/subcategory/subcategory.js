import { api } from "../baseurl/baseurl";

export const getSubCategories = () => {
  return api.get("/subcategories");
};
