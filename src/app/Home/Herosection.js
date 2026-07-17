"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchBanners, getBannersForCategory } from "../apis/banners/banners";

export default function HeroSection() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    fetchBanners().
    then((data) => {
      if (!isMounted) return;
      setBanners(getBannersForCategory(data));
    }).
    catch(() => {
      if (!isMounted) return;
      setBanners([]);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  useEffect(() => {
    if (current >= banners.length) setCurrent(0);
  }, [banners.length, current]);

  const goTo = (index) => {
    clearInterval(timerRef.current);
    setCurrent(index);
  };

  const goPrev = () => {
    clearInterval(timerRef.current);
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goNext = () => {
    clearInterval(timerRef.current);
    setCurrent((prev) => (prev + 1) % banners.length);
  };



  const goToShop = (bannerId) => {
    router.push(`/shop?bannerId=${bannerId}`);
  };

  const handleBannerClick = (banner) => {
    goToShop(banner._id);
  };

  if (banners.length === 0) return null;

  return (


    <section className="w-full">
      <div className="max-w-[1450px] mx-auto px-3 sm:px-6 lg:px-10 pt-4">
        <div className="relative w-full h-[240px] sm:h-[340px] rounded-2xl overflow-hidden shadow-md">
          <div
            className="flex w-full h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}>
            
            {banners.map((banner) =>
            // FIX (S6819): this was a <div role="button" tabIndex={0} ...>.
            // A real <button> is the native interactive element, so we use
            // one directly instead of faking button semantics with role.
            // Note: a <button> can't legally contain another <button>, so
            // the old nested "Explore Now" <button> is now a plain <span>
            // that's styled the same way — clicking it (or anywhere else
            // on the slide) triggers the same handleBannerClick action, so
            // no behaviour is lost.
            <button
              key={banner._id}
              type="button"
              onClick={() => handleBannerClick(banner)}
              className="relative w-full h-full flex-shrink-0 cursor-pointer overflow-hidden text-left block">
              
                <img
                src={banner.image_url}
                alt={banner.title || "banner"}
                className="absolute inset-0 w-full h-full object-cover scale-110" />
              

                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

                <div className="absolute inset-0 z-10 h-full flex flex-col justify-center max-w-[70%] sm:max-w-[55%] px-6 sm:px-10">
                  <h2 className="text-white font-extrabold text-2xl sm:text-4xl leading-tight drop-shadow-md">
                    {banner.title}
                  </h2>

                  {banner.description &&
                <p className="text-white/90 font-medium text-sm sm:text-base mt-2 drop-shadow-sm">
                      {banner.description}
                    </p>
                }

                  {banner.discount_percentage > 0 &&
                <p className="text-yellow-300 font-semibold text-sm sm:text-base mt-1">
                      Flat {banner.discount_percentage}% OFF
                    </p>
                }

                  <span
                  className="mt-4 w-fit bg-white text-black font-semibold text-sm sm:text-base px-5 py-2 rounded-full hover:bg-gray-100 transition">
                  
                    Explore Now
                  </span>
                </div>
              </button>
            )}
          </div>

          {banners.length > 1 &&
          <>
              <button
              type="button"
              onClick={goPrev}
              aria-label="Previous banner"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-black w-9 h-9 rounded-full flex items-center justify-center shadow">
              
                ‹
              </button>
              <button
              type="button"
              onClick={goNext}
              aria-label="Next banner"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-black w-9 h-9 rounded-full flex items-center justify-center shadow">
              
                ›
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((banner, index) =>
              <button
                key={banner._id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                index === current ? "w-6 bg-white" : "w-2 bg-white/50"}`
                } />

              )}
              </div>
            </>
          }
        </div>
      </div>
    </section>);

}