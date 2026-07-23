"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import {
  fetchBanners,
  getCategoryNameFromBanner,
  getVendorIdFromBanner,
} from "../apis/banners/banners.js";

export default function FestiveOfferBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  
  const selectedCategory = searchParams.get("category");

  const [allBanners, setAllBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const timerRef = useRef(null);

  // Loads homepage banners from the backend banner API.
  useEffect(() => {
    let isMounted = true;

    async function loadBanners() {
      try {
        setLoading(true);

        const data = await fetchBanners();

        if (!isMounted) return;

        setAllBanners(Array.isArray(data) ? data : []);
        setError(false);
      } catch (err) {
        console.error("Banner fetch failed:", err);

        if (isMounted) {
          setAllBanners([]);
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBanners();

    return () => {
      isMounted = false;

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Filters banners to the selected category when a category is active.
  const banners = selectedCategory
    ? allBanners.filter((banner) => {
        const categoryName = getCategoryNameFromBanner(banner);

        return (
          categoryName?.toLowerCase() === selectedCategory.toLowerCase()
        );
      })
    : allBanners;

  // Resets the slider to the first banner when the category changes.
  useEffect(() => {
    queueMicrotask(() => setIndex(0));
  }, [selectedCategory]);

  // Keeps the active slide index valid when the banner list changes.
  useEffect(() => {
    if (index >= banners.length) {
      queueMicrotask(() => setIndex(0));
    }
  }, [banners.length, index]);

  // Advances the banner slider automatically while multiple banners exist.
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (banners.length <= 1) {
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setIndex((previousIndex) => {
        return (previousIndex + 1) % banners.length;
      });
    }, 4000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [banners.length]);

  const stopAutoSlide = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const goToSlide = (slideIndex) => {
    stopAutoSlide();
    setIndex(slideIndex);
  };

  const goToPreviousSlide = (event) => {
    event.stopPropagation();
    stopAutoSlide();

    setIndex((previousIndex) => {
      return (previousIndex - 1 + banners.length) % banners.length;
    });
  };

  const goToNextSlide = (event) => {
    event.stopPropagation();
    stopAutoSlide();

    setIndex((previousIndex) => {
      return (previousIndex + 1) % banners.length;
    });
  };

  // Builds the shop link for a banner category and vendor.
  const getShopLink = (banner) => {
    const categoryName = getCategoryNameFromBanner(banner);
    const vendorId = getVendorIdFromBanner(banner);

    if (!categoryName) {
      return "/shop";
    }

    const queryParams = new URLSearchParams();

    queryParams.set("category", categoryName);

    if (vendorId) {
      queryParams.set("vendorId", vendorId);
    }

    return `/shop?${queryParams.toString()}`;
  };

  const handleBannerClick = (banner) => {
    router.push(getShopLink(banner));
  };

  const handleBannerKeyDown = (event, banner) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleBannerClick(banner);
    }
  };

  if (loading) {
    return (
      <section className="w-full">
        <div className="mx-auto max-w-[1450px] px-3 pt-4 sm:px-6 lg:px-10">
          <div className="h-[240px] w-full animate-pulse rounded-2xl bg-zinc-200 sm:h-[340px]" />
        </div>
      </section>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mx-auto max-w-[1450px] px-3 pt-4 sm:px-6 lg:px-10">
        <div className="relative h-[240px] w-full overflow-hidden rounded-2xl shadow-md sm:h-[340px] lg:h-[390px]">
          {/* SLIDER */}
          <div
            className="flex h-full w-full transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${index * 100}%)`,
            }}
          >
            {banners.map((banner) => {
              const categoryName = getCategoryNameFromBanner(banner);

              return (
                <button
                  type="button"
                  key={banner._id}
                  onClick={() => handleBannerClick(banner)}
                  className="relative h-full w-full flex-shrink-0 cursor-pointer overflow-hidden text-left"
                >
                  {/* BANNER IMAGE */}
                  <Image
                    src={banner.image_url}
                    alt={banner.title || categoryName || "Banner"}
                    fill
                    priority={index === 0}
                    unoptimized
                    sizes="100vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />

                  {/* DARK OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

                  {/* BANNER CONTENT */}
                  <div className="absolute inset-0 z-10 flex h-full max-w-[85%] flex-col justify-center px-6 sm:max-w-[60%] sm:px-10 lg:max-w-[50%] lg:px-14">
                    {categoryName && (
                      <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-white/80 sm:text-base">
                        {categoryName}
                      </p>
                    )}

                    <h2 className="text-2xl font-extrabold leading-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
                      {banner.title}
                    </h2>

                    {banner.description && (
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-white/90 drop-shadow-sm sm:text-base lg:text-lg">
                        {banner.description}
                      </p>
                    )}

                    {typeof banner.discount_percentage === "number" &&
                      banner.discount_percentage > 0 && (
                        <p className="mt-2 text-sm font-bold text-yellow-300 sm:text-base lg:text-lg">
                          Flat {banner.discount_percentage}% OFF
                        </p>
                      )}

                    {banner.vendorId?.companyname && (
                      <p className="mt-2 text-xs font-medium text-white/70 sm:text-sm">
                        Powered by {banner.vendorId.companyname}
                      </p>
                    )}

                    <span
                      className="mt-4 w-fit rounded-full bg-white px-5 py-2 text-sm font-semibold text-black shadow-md transition hover:bg-gray-100 sm:px-6 sm:py-2.5 sm:text-base"
                    >
                      Explore Now
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* PREVIOUS AND NEXT BUTTONS */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPreviousSlide}
                aria-label="Previous banner"
                className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl text-black shadow-md transition hover:bg-white sm:h-11 sm:w-11"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={goToNextSlide}
                aria-label="Next banner"
                className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl text-black shadow-md transition hover:bg-white sm:h-11 sm:w-11"
              >
                ›
              </button>

              {/* SLIDER DOTS */}
              <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {banners.map((banner, slideIndex) => (
                  <button
                    type="button"
                    key={banner._id || slideIndex}
                    onClick={(event) => {
                      event.stopPropagation();
                      goToSlide(slideIndex);
                    }}
                    aria-label={`Go to slide ${slideIndex + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      slideIndex === index
                        ? "w-7 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
