import { api } from "../baseurl/baseurl";

export const getSubToSubCategories = () => {
  return api.get("/subtosubcategories");
};
