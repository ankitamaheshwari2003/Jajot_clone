const BASE_URL = "https://amazon-multi-vendor-3.onrender.com/api";

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


export const priceRanges = [
{ label: "All", min: undefined, max: undefined },
{ label: "Under ₹1,000", min: undefined, max: 1000 },
{ label: "₹1,000 - ₹5,000", min: 1000, max: 5000 },
{ label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
{ label: "₹10,000 - ₹20,000", min: 10000, max: 20000 },
{ label: "Over ₹20,000", min: 20000, max: undefined }];
