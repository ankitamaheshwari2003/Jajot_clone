import { BASE_URL } from "../baseurl/baseurl";

// Fetches active filter attributes for one category from the backend API.
export async function getCategoryAttributes(categoryId) {
  if (!categoryId) return [];

  const res = await fetch(`${BASE_URL}/categoryattribute/category/${categoryId}`);
  if (!res.ok) {
    throw new Error(`Failed to load category attributes (${res.status})`);
  }

  const json = await res.json();
  const attributes = json?.data || [];


  return attributes.filter(
    (attr) => attr.status === "active" && !attr.isDeleted
  );
}


// Fetches products that match category, price, rating, and attribute filters.
export async function getFilteredProducts(filters = {}) {
  const query = new URLSearchParams();

  const { attributes, ...rest } = filters;

  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "All") return;
    query.append(key, value);
  });


  if (attributes && typeof attributes === "object") {
    Object.entries(attributes).forEach(([code, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) {
        if (value.length) query.append(code, value.join(","));
      } else {
        query.append(code, value);
      }
    });
  }

  const res = await fetch(`${BASE_URL}/products/filter?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load filtered products (${res.status})`);
  }
  return res.json();
}


// Provides reusable price range options for shop filters.
export const priceRanges = [
{ label: "All", min: undefined, max: undefined },
{ label: "Under â‚¹1,000", min: undefined, max: 1000 },
{ label: "â‚¹1,000 - â‚¹5,000", min: 1000, max: 5000 },
{ label: "â‚¹5,000 - â‚¹10,000", min: 5000, max: 10000 },
{ label: "â‚¹10,000 - â‚¹20,000", min: 10000, max: 20000 },
{ label: "Over â‚¹20,000", min: 20000, max: undefined }];
