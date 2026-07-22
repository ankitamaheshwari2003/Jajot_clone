"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquareText, Star, ThumbsUp, UserRound } from "lucide-react";

import {
  fetchProductReviewsByProduct,
  getApiReviewList,
  getReviewSummary
} from "../../apis/reviews/reviews";

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

export default function AllReviewsPage() {
  const router = useRouter();
  const params = useParams();
  const pid = params?.pid;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pid) return;

    const loadReviews = async () => {
      try {
        setLoading(true);
        const res = await fetchProductReviewsByProduct(pid);
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

    loadReviews();
  }, [pid]);

  const { average, count } = getReviewSummary(reviews);

  const latestReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <section className="min-h-screen bg-[#f5f5f5] py-6">
      <div className="mx-auto w-full max-w-[1450px] px-3 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Header bar */}
            <div className="flex flex-col gap-4 border-b border-gray-100 bg-[#131921] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20"
                  aria-label="Go back"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF9900] text-black">
                  <MessageSquareText size={21} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#FF9900]">
                    Customer Reviews
                  </p>
                  <h3 className="mt-1 text-xl font-black leading-7 text-white">
                    All reviews from India
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    Sorted with the latest reviews first.
                  </p>
                </div>
              </div>

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
            </div>

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

              {!loading && !error && latestReviews.length === 0 && (
                <div className="my-5 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                  <MessageSquareText className="mx-auto mb-3 text-[#FF9900]" size={28} />
                  <p className="text-sm font-semibold text-gray-700">No reviews yet</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Be the first to review this product.
                  </p>
                </div>
              )}

              {!loading &&
                latestReviews.map((review) => {
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
                            <p className="font-semibold text-[#0F1111]">{reviewerName}</p>
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

            {/* <div className="mt-4 text-center">
              <Link
                href={`/ProductDetailpage/${pid || ""}`}
                className="text-sm font-semibold text-[#FF9900] hover:underline"
              >
                &larr; Back to product page
              </Link>
            </div> */}
          </div>

          <aside className="h-fit overflow-hidden rounded-2xl border border-[#FF9900]/20 bg-white shadow-sm lg:sticky lg:top-36">
            <div className="bg-[#131921] px-5 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wide text-[#FF9900]">
                Review Summary
              </p>
              <h3 className="mt-2 text-xl font-black leading-7">
                Real feedback helps better buying
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Latest customer reviews, ratings, and photos are shown here so you can understand the product before ordering.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-[#FF9900]/10 p-4">
                <p className="text-sm font-bold text-[#0F1111]">
                  Customer rating
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {count > 0 ? (
                    <RatingBadge rating={average} size="lg" />
                  ) : (
                    <span className="rounded bg-gray-200 px-2 py-1 text-sm font-semibold text-gray-600">
                      No rating
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-700">
                    {count} {count === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-bold text-[#0F1111]">
                  What to look for
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Check recent comments, star ratings, and customer images to compare quality, delivery experience, and product condition.
                </p>
              </div>

              <Link
                href={`/ProductDetailpage/${pid || ""}`}
                className="flex h-11 items-center justify-center rounded-xl bg-[#FF9900] px-4 text-sm font-bold text-black transition hover:bg-[#e68a00]"
              >
                View Product Details
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
