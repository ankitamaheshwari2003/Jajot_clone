import BestSellersSection from "./BestSellersSection";
import Herosection from "./Herosection";
import OfferBannerSlider from "./Offerbannerslider";
import ProductGridSection from "./Productgrid";
import ProductSlider from "./ProductSlider";
import ShopByCategory from "./ShopByCategoryCards";
import TrendingProductsSection from "./TrendingProductSlider";

export default function HomePage() {
  return (
    <div>
      <Herosection />
      <OfferBannerSlider />
      <ProductGridSection />
      <ProductSlider />
      <TrendingProductsSection />
      
        <ShopByCategory />
        <BestSellersSection />
        


    </div>);

}
