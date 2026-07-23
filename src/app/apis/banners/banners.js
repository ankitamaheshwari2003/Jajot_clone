import { BASE_URL } from "../baseurl/baseurl";

// Fetches active homepage banners from the backend banner API.
export async function fetchBanners() {
  const res = await fetch(`${BASE_URL}/banners?session_type=home_page`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch banners");
  }

  const data = await res.json();

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error("Invalid banners response");
  }

  return data.data.filter((banner) => banner.is_active);
}

// Returns a safe banner list for category-based rendering.
export function getBannersForCategory(banners) {
  return Array.isArray(banners) ? banners : [];
}

// Extracts a banner category name from supported backend response shapes.
export function getCategoryNameFromBanner(banner) {
  const categoryName =
    banner?.categoryId?.name || banner?.categoryName || banner?.category;
  return typeof categoryName === "string" ? categoryName.trim() : "";
}

// Extracts a banner vendor id from supported backend response shapes.
export function getVendorIdFromBanner(banner) {
  const vendorId = banner?.vendorId?._id || banner?.vendorId;
  return typeof vendorId === "string" ? vendorId.trim() : "";
}

// Fetches products attached to one banner from the backend banner-products API.
export async function fetchBannerProducts(bannerId) {
  const res = await fetch(`${BASE_URL}/banners/${bannerId}/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch banner products");
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error("Invalid banner products response");
  }

  return data;
}

// Extracts the category name from a banner detail response.
export function getCategoryNameFromBannerDetail(detail) {
  const categoryName = detail?.banner?.category?.name;
  return typeof categoryName === "string" ? categoryName.trim() : "";
}

// Extracts the vendor id from a banner detail response.
export function getVendorIdFromBannerDetail(detail) {
  const vendorId = detail?.banner?.vendor?._id;
  return typeof vendorId === "string" ? vendorId.trim() : "";
}

// Returns the product list attached to a banner detail response.
export function getProductsFromBannerDetail(detail) {
  return Array.isArray(detail?.data) ? detail.data : [];
}
