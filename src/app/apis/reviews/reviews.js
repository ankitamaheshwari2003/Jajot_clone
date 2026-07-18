import axios from "axios";

const BASE_URL = "https://amazon-multi-vendor-3.onrender.com";
const REVIEW_ENDPOINT = `${BASE_URL}/api/product_review`;

/**
 * GET /api/product_review/product/:pid
 * Seedha product ke hisaab se filtered reviews backend se milte hain.
 */
export async function fetchProductReviewsByProduct(pid) {
  const res = await axios.get(`${REVIEW_ENDPOINT}/product/${pid}`);
  return res;
}

/**
 * GET /api/product_review (query params ke saath) - fallback/legacy.
 */
export async function fetchProductReviews({ pid, variantId } = {}) {
  const res = await axios.get(REVIEW_ENDPOINT, {
    params: {
      pid,
      variantId
    }
  });

  return res;
}

/**
 * POST /api/product_review
 */
export async function createProductReview(payload) {
  return axios.post(REVIEW_ENDPOINT, payload);
}

/** Response normalize karta hai -> hamesha array return karega */
export function getApiReviewList(data) {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

/** pid populated object ho ya plain id, dono case handle */
export function getReviewProductId(review) {
  const pid = review?.pid;
  return pid && typeof pid === "object" ? pid._id : pid;
}

export function getReviewProductName(review) {
  const pid = review?.pid;
  return pid && typeof pid === "object" ? pid.productName : "";
}

/** variantId populated object ho ya plain id, dono case handle */
export function getReviewVariantId(review) {
  const variant = review?.variantId;
  return variant && typeof variant === "object" ? variant._id : variant;
}

export function getReviewVariantSku(review) {
  const variant = review?.variantId;
  return variant && typeof variant === "object" ? variant.sku : "";
}

/** vendorId populated object ho ya plain id, dono case handle */
export function getReviewVendorId(review) {
  const vendor = review?.vendorId;
  return vendor && typeof vendor === "object" ? vendor._id : vendor;
}

/**
 * Client-side safety filter: agar backend GET sab reviews bhej de
 * (bina query filter ke), to yahan se sahi product/variant ke reviews chhaante hain.
 */
export function filterReviewsForProduct(reviews, productId, variantId) {
  if (!Array.isArray(reviews)) return [];

  return reviews.filter((review) => {
    const sameProduct = String(getReviewProductId(review)) === String(productId);

    if (!variantId) return sameProduct;

    const reviewVariantId = getReviewVariantId(review);
    // agar review mein variantId hi nahi hai to product-level match kaafi hai
    const sameVariant = !reviewVariantId || String(reviewVariantId) === String(variantId);

    return sameProduct && sameVariant;
  });
}

/** Average rating + count nikalne ke liye helper */
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