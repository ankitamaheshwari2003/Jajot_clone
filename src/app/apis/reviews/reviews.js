import { api } from "../baseurl/baseurl";

const REVIEW_ENDPOINT = "/product_review";

// Fetches reviews for one product directly from the product review API.
export async function fetchProductReviewsByProduct(pid) {
  const res = await api.get(`${REVIEW_ENDPOINT}/product/${pid}`);
  return res;
}

// Fetches reviews with optional product and variant query filters.
export async function fetchProductReviews({ pid, variantId } = {}) {
  const res = await api.get(REVIEW_ENDPOINT, {
    params: {
      pid,
      variantId
    }
  });

  return res;
}

// Creates a product review and supports both JSON and image FormData payloads.
export async function createProductReview(payload) {
  const isFormData = payload instanceof FormData;

  return api.post(REVIEW_ENDPOINT, payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined
  });
}

// Normalizes any review API response into a plain review array.
export function getApiReviewList(data) {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

// Returns the product id from either a populated review product or a plain id.
export function getReviewProductId(review) {
  const pid = review?.pid;
  return pid && typeof pid === "object" ? pid._id : pid;
}

// Returns the product name when the review includes a populated product.
export function getReviewProductName(review) {
  const pid = review?.pid;
  return pid && typeof pid === "object" ? pid.productName : "";
}

// Returns the variant id from either a populated review variant or a plain id.
export function getReviewVariantId(review) {
  const variant = review?.variantId;
  return variant && typeof variant === "object" ? variant._id : variant;
}

// Returns the variant SKU when the review includes a populated variant.
export function getReviewVariantSku(review) {
  const variant = review?.variantId;
  return variant && typeof variant === "object" ? variant.sku : "";
}

// Returns the vendor id from either a populated review vendor or a plain id.
export function getReviewVendorId(review) {
  const vendor = review?.vendorId;
  return vendor && typeof vendor === "object" ? vendor._id : vendor;
}

// Filters reviews on the client when the backend returns broader review data.
export function filterReviewsForProduct(reviews, productId, variantId) {
  if (!Array.isArray(reviews)) return [];

  return reviews.filter((review) => {
    const sameProduct = String(getReviewProductId(review)) === String(productId);

    if (!variantId) return sameProduct;

    const reviewVariantId = getReviewVariantId(review);
    // Keeps product-level reviews when a review has no variant id.
    const sameVariant = !reviewVariantId || String(reviewVariantId) === String(variantId);

    return sameProduct && sameVariant;
  });
}

// Calculates the average rating and total review count.
export function getReviewSummary(reviews) {
  const list = Array.isArray(reviews) ? reviews : [];
  const count = list.length;

  if (count === 0) {
    return { average: 0, count: 0 };
  }

  const total = list.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
  const average = Math.round((total / count) * 10) / 10;

  return { average, count };
}
