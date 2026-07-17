import { api } from "../baseurl/baseurl";

export const getCategories = () => {
  return api.get("/categories");
};
