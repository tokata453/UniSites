import HeroCarousel from "@/components/HeroCarousel";
import Marquee from "@/components/Marquee";
import BrowseCategories from "@/components/BrowseCategories";
import BestSellers from "@/components/BestSellers";
import OnSaleProducts from "@/components/OnSaleProducts";

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <Marquee />
      <BrowseCategories />
      <BestSellers />
      <OnSaleProducts />
    </>
  );
}