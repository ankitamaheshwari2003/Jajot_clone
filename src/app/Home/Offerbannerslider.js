"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const DUMMY_OFFERS = [
{
  id: "1",
  image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
  brandName: "anveshan",
  brandLogo: null,
  discountText: "Min. 20% Off",
  subtitle: "Brand day deals",
  link: "/shop/anveshan"
},
{
  id: "2",
  image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
  brandName: "DOLLAR MISSY",
  brandLogo: null,
  discountText: "Min. 35% Off",
  subtitle: "Women's trousers",
  link: "/shop/dollar-missy"
},
{
  id: "3",
  image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
  brandName: "GARNIER",
  brandLogo: null,
  discountText: "Up to 35% Off",
  subtitle: "Fresh & matte",
  link: "/shop/garnier"
},
{
  id: "4",
  image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
  brandName: "NIVEA",
  brandLogo: null,
  discountText: "Min. 25% Off",
  subtitle: "Skin care essentials",
  link: "/shop/nivea"
}];


export default function OfferBannerSlider({ offers = DUMMY_OFFERS }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [offers]);

  const scrollByAmount = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-offer-card]")?.offsetWidth || 260;
    el.scrollBy({ left: dir * (cardWidth + 16), behavior: "smooth" });
  };

  if (!offers || offers.length === 0) return null;

  return (
    <section className="relative mx-auto w-full max-w-[1450px] px-3 py-4 sm:px-6 lg:px-10">
      {}
      {canScrollLeft &&
      <button
        type="button"
        aria-label="Scroll offers left"
        onClick={() => scrollByAmount(-1)}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-orange-100 hover:bg-orange-50 transition-colors">
        
          <ChevronIcon direction="left" />
        </button>
      }

      {}
      {canScrollRight &&
      <button
        type="button"
        aria-label="Scroll offers right"
        onClick={() => scrollByAmount(1)}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-orange-100 hover:bg-orange-50 transition-colors">
        
          <ChevronIcon direction="right" />
        </button>
      }

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {offers.map((offer) =>
        <a
          key={offer.id}
          href={offer.link || "#"}
          data-offer-card
          className="group relative flex-shrink-0 w-[230px] sm:w-[250px] rounded-2xl overflow-hidden bg-white border border-orange-100 shadow-sm hover:shadow-lg transition-shadow">
          
            {}
            <div className="relative w-full h-[160px] bg-orange-50">
              <Image
              src={offer.image}
              alt={offer.subtitle || offer.brandName}
              fill
              sizes="250px"
              className="object-cover group-hover:scale-105 transition-transform duration-300" />
            

              {}
              <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] tracking-wide px-2 py-0.5 rounded">
                AD
              </span>

              {}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%]">
                <div className="bg-white rounded-full shadow-md px-3 py-1.5 flex items-center justify-center">
                  {offer.brandLogo ?
                <Image
                  src={offer.brandLogo}
                  alt={offer.brandName}
                  width={90}
                  height={20}
                  className="object-contain h-5 w-auto" /> :


                <span className="text-xs font-semibold text-gray-800 truncate">
                      {offer.brandName}
                    </span>
                }
                </div>
              </div>
            </div>

            {}
            <div className="pt-6 pb-4 px-3 text-center">
              <p className="font-bold text-[15px] text-gray-900">{offer.discountText}</p>
              <p className="text-sm text-gray-500 mt-0.5">{offer.subtitle}</p>
            </div>
          </a>
        )}
      </div>
    </section>);

}

function ChevronIcon({ direction }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-orange-600"
      style={{ transform: direction === "left" ? "rotate(180deg)" : "none" }}>
      
      <polyline points="9 18 15 12 9 6" />
    </svg>);

}
