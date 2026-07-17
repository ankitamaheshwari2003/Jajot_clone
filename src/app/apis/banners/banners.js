const API_BASE = "https://amazon-multi-vendor-3.onrender.com/api";

export async function fetchBanners() {
  const res = await fetch(`${API_BASE}/banners?session_type=home_page`, {
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

export function getBannersForCategory(banners) {
  return Array.isArray(banners) ? banners : [];
}

export function getCategoryNameFromBanner(banner) {
  const categoryName =
    banner?.categoryId?.name || banner?.categoryName || banner?.category;
  return typeof categoryName === "string" ? categoryName.trim() : "";
}

export function getVendorIdFromBanner(banner) {
  const vendorId = banner?.vendorId?._id || banner?.vendorId;
  return typeof vendorId === "string" ? vendorId.trim() : "";
}

// Real response shape from /banners/:id/products:
// {
//   success, message,
//   banner: { title, discount_percentage, vendor: { _id, name, companyname }, category: { _id, name, slug } },
//   total,
//   data: [ ...products tied to this banner... ]
// }
export async function fetchBannerProducts(bannerId) {
  const res = await fetch(`${API_BASE}/banners/${bannerId}/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch banner products");
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error("Invalid banner products response");
  }

  return data; // { success, message, banner, total, data }
}

export function getCategoryNameFromBannerDetail(detail) {
  const categoryName = detail?.banner?.category?.name;
  return typeof categoryName === "string" ? categoryName.trim() : "";
}

export function getVendorIdFromBannerDetail(detail) {
  const vendorId = detail?.banner?.vendor?._id;
  return typeof vendorId === "string" ? vendorId.trim() : "";
}

// Products jo is banner ke saath tied hain, seedha response.data se milte hain.
export function getProductsFromBannerDetail(detail) {
  return Array.isArray(detail?.data) ? detail.data : [];
}