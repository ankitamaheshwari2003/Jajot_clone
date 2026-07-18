"use client";

import { useEffect, useState } from "react";
import {
  ImagePlus,
  MessageSquareText,
  Star,
  ThumbsUp,
  UserRound,
  X
} from "lucide-react";

import {
  createProductReview,
  fetchProductReviewsByProduct,
  getApiReviewList,
  getReviewSummary
} from "../apis/reviews/reviews";
import { getLoggedInCid } from "../apis/customer/customer";

function RatingBadge({ rating, size = "sm" }) {
  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded ${
        isSmall ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
      } font-medium text-white bg-[#26A541]`}
    >
      {rating}
      <Star size={isSmall ? 10 : 12} fill="currentColor" />
    </span>
  );
}

function formatReviewDate(dateStr) {
  if (!dateStr) return "";

  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch {
    return "";
  }
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ReviewsSection({ productId, variantId, vendorId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formRating, setFormRating] = useState(5);
  const [formUserName, setFormUserName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [formImages, setFormImages] = useState([]);

  const loadReviews = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const res = await fetchProductReviewsByProduct(productId);
      const list = getApiReviewList(res.data);
      setReviews(list);
      setError("");
    } catch (err) {
      console.error(
        "Reviews load failed:",
        err?.response?.data?.message || err.message
      );
      setError("Reviews could not load.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const { average, count } = getReviewSummary(reviews);

  const resetForm = () => {
    setFormRating(5);
    setFormUserName("");
    setFormDescription("");
    setImageUrlInput("");
    setFormImages([]);
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (formImages.includes(trimmed)) return;

    setFormImages((prev) => [...prev, trimmed]);
    setImageUrlInput("");
  };

  const handleRemoveImageUrl = (url) => {
    setFormImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!productId || submitting) return;

    const cid = getLoggedInCid();

    if (!cid) {
      window.dispatchEvent(
        new CustomEvent("shopToast", {
          detail: {
            title: "Login required",
            message: "Please login to write a review."
          }
        })
      );
      return;
    }

    if (!formDescription.trim()) return;

    setSubmitting(true);

    try {
      await createProductReview({
        pid: productId,
        variantId: variantId || undefined,
        vendorId: vendorId || undefined,
        userName: formUserName.trim() || "Amazon Customer",
        description: formDescription.trim(),
        rating: formRating,
        image: formImages
      });

      resetForm();
      setFormOpen(false);
      await loadReviews();

      window.dispatchEvent(
        new CustomEvent("shopToast", {
          detail: {
            title: "Review submitted",
            message: "Thanks for sharing your feedback."
          }
        })
      );
    } catch (err) {
      console.error(
        "Review submit failed:",
        err?.response?.data?.message || err.message
      );
      window.dispatchEvent(
        new CustomEvent("shopToast", {
          detail: {
            title: "Review failed",
            message: "Could not submit your review. Try again."
          }
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-t border-gray-200 bg-[#f5f5f5] px-3 py-6 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 bg-[#131921] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF9900] text-black">
                <MessageSquareText size={21} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#FF9900]">
                  Customer Reviews
                </p>
                <h3 className="mt-1 text-xl font-black leading-7 text-white">
                  Top reviews from India
                </h3>
                <p className="mt-1 text-sm text-white/70">
                  Real feedback from shoppers helps everyone choose better.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {count > 0 ? (
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <RatingBadge rating={average} size="lg" />
                    <span className="text-sm font-semibold text-white">
                      {count} {count === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/80">
                  No ratings yet
                </div>
              )}

              <button
                onClick={() => setFormOpen((open) => !open)}
                className="h-10 shrink-0 rounded-xl bg-[#FF9900] px-5 text-sm font-bold text-black transition hover:bg-[#e08a00]"
              >
                {formOpen ? "Cancel" : "Write a review"}
              </button>
            </div>
          </div>

          {formOpen && (
            <form
              onSubmit={handleSubmitReview}
              className="m-5 rounded-2xl border border-[#FF9900]/30 bg-[#FF9900]/5 p-4 sm:p-5"
            >
              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="rounded-xl border border-orange-100 bg-white p-4">
                  <p className="text-sm font-bold text-[#0F1111]">Your rating</p>
                  <div className="mt-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        aria-label={`${star} star`}
                        className="rounded-md p-1 transition hover:bg-orange-50"
                      >
                        <Star
                          size={24}
                          className={
                            star <= formRating ? "text-[#FF9900]" : "text-gray-300"
                          }
                          fill={star <= formRating ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500">
                    Share what worked, what did not, and whether delivery matched
                    expectations.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                        Your name
                      </label>
                      <input
                        type="text"
                        value={formUserName}
                        onChange={(e) => setFormUserName(e.target.value)}
                        placeholder="e.g. Priyanka"
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                        Add image URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:border-[#FF9900] hover:text-[#FF9900]"
                          aria-label="Add image URL"
                        >
                          <ImagePlus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Your review
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="What did you like or dislike?"
                      rows={4}
                      required
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30"
                    />
                  </div>

                  {(imageUrlInput.trim() || formImages.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {imageUrlInput.trim() && (
                        <div className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <img
                            src={imageUrlInput.trim()}
                            alt="preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.opacity = "0.2";
                            }}
                            onLoad={(e) => {
                              e.currentTarget.style.opacity = "1";
                            }}
                          />
                        </div>
                      )}

                      {formImages.map((img) => (
                        <div
                          key={img}
                          className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white"
                        >
                          <img
                            src={img}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.opacity = "0.2";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImageUrl(img)}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-black"
                            aria-label="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="h-11 rounded-xl bg-[#FF9900] px-6 text-sm font-bold text-black transition hover:bg-[#e08a00] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : "Submit review"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          <div className="px-5 py-2">
            {loading && (
              <div className="py-5">
                <div className="h-4 w-36 rounded bg-gray-100 animate-skeleton" />
                <div className="mt-4 h-20 rounded-xl bg-gray-100 animate-skeleton" />
              </div>
            )}

            {!loading && error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            {!loading && !error && reviews.length === 0 && (
              <div className="my-5 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <MessageSquareText className="mx-auto mb-3 text-[#FF9900]" size={28} />
                <p className="text-sm font-semibold text-gray-700">No reviews yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Be the first to review this product.
                </p>
              </div>
            )}

            {!loading &&
              reviews.map((review) => {
                const reviewerName = review.userName || "Amazon Customer";
                const reviewerInitials = getInitials(reviewerName);

                return (
                  <article
                    key={review._id}
                    className="border-b border-gray-100 py-5 last:border-b-0"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF9900]/10 text-sm font-black text-[#FF9900]">
                        {reviewerInitials || <UserRound size={18} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[#0F1111]">
                            {reviewerName}
                          </p>
                          <RatingBadge rating={review.rating || 0} />
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          Reviewed in India on {formatReviewDate(review.createdAt)}
                        </p>

                        <p className="mt-3 max-w-3xl text-[15px] leading-6 text-[#0F1111]">
                          {review.description}
                        </p>

                        {Array.isArray(review.image) && review.image.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {review.image.map((img) => (
                              <img
                                key={img}
                                src={img}
                                alt=""
                                className="h-20 w-20 rounded-xl border border-gray-200 bg-gray-50 object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <button className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-600 transition hover:border-[#FF9900] hover:text-[#FF9900]">
                          <ThumbsUp size={13} />
                          Helpful
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
