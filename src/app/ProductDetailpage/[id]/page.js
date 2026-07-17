import ProductDetailsPage from "../productdetails";
import RelatedProducts from "../RelatedProducts";
import { fetchProductById } from "../../apis/products/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;

  let product = null;

  try {
    product = await fetchProductById(id);
  } catch {
    product = null;
  }

  if (!product) {
    return {
      title: "Product Not Found | Jajot",
      description: "The product you are looking for does not exist."
    };
  }

  const brandSuffix = product.brand ? ` | ${product.brand}` : "";
const title = `${product.name}${brandSuffix} - Buy Online at Jajot`;

  const description =
  product?.description ||
  `Buy ${product.name} online at best price on Jajot.`;

  const keywords = [
  product?.brand,
  product?.name,
  product?.category].
  filter(Boolean);

  const imageUrl = /^https?:\/\//i.test(product?.image || "") ?
  product.image :
  "";

  const url = `https://www.yourdomain.com/ProductDetailpage/${id}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Jajot",
      images: imageUrl ?
      [
      {
        url: imageUrl,
        width: 1200,
        height: 1200,
        alt: product.name
      }] :

      [],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : []
    }
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;

  let product = null;

  try {
    product = await fetchProductById(id);
  } catch {
    product = null;
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-black pb-24">
      <ProductDetailsPage initialProduct={product} initialProductId={id} />
      <RelatedProducts />
    </main>);

}
