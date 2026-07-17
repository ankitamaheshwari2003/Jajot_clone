"use client";

import { Suspense } from "react";
import ProductPage from "./porductpage";

import PageSkeleton from "../component/PageSkeleton";
import CategoryOfferStrip from "./CategoryOfferStrip";
import FestiveOfferBanner from "./FestiveOfferBanner";

export default function ShopPage() {
  return (
    <Suspense fallback={<PageSkeleton type="grid" />}>
      {}
       <FestiveOfferBanner />
       
      <ProductPage />
     <CategoryOfferStrip />

    </Suspense>);

}
