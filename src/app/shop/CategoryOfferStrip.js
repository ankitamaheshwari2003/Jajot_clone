
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";


const offers = [
{
  category: "Electronics",
  title: "Electronics Fest",
  discount: "Up to 60% off",
  image:
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
  bg: "from-orange-500/90 to-orange-700/90"
},
{
  category: "Fashion",
  title: "Fashion Sale",
  discount: "Up to 50% off",
  image:
  "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
  bg: "from-pink-500/90 to-rose-700/90"
},
{
  category: "Mobiles",
  title: "Mobile Accessories",
  discount: "Up to 65% off",
  image:
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
  bg: "from-blue-500/90 to-indigo-700/90"
},
{
  category: "Gaming",
  title: "Gaming Zone",
  discount: "Up to 40% off",
  image:
  "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop",
  bg: "from-purple-500/90 to-violet-700/90"
}];


export default function CategoryOfferStrip() {
  return (
    <section className="mt-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {offers.map((offer) =>
        <Link
          key={offer.category}
          href={`/shop?category=${encodeURIComponent(offer.category)}`}
          className="group relative h-[150px] overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg sm:h-[170px]">
          
            {}
            <img
            src={offer.image}
            alt={offer.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          

            {}
            <div
            className={`absolute inset-0 bg-gradient-to-t ${offer.bg} opacity-80`} />
          

            {}
            <div className="relative z-10 flex h-full flex-col justify-between p-3 sm:p-4">
              <span className="w-fit rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-black sm:text-xs">
                FESTIVE OFFER
              </span>

              <div>
                <h3 className="text-sm font-bold text-white sm:text-base">
                  {offer.title}
                </h3>
                <p className="text-xs font-semibold text-white/90 sm:text-sm">
                  {offer.discount}
                </p>

                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 group-hover:gap-2 transition-all sm:text-xs">
                  Shop now
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>);

}
