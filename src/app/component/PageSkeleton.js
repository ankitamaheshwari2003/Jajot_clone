const skeletonClass = "animate-skeleton rounded bg-gray-200";

// Generates stable skeleton keys outside JSX map callbacks.
function generateSkeletonIds(prefix, count) {
  return Array.from({ length: count }, (_, i) => `${prefix}-${i}`);
}

function SkeletonBlock({ className = "" }) {
  return <div className={`${skeletonClass} ${className}`} />;
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <SkeletonBlock className="aspect-square w-full rounded-none" />
      <div className="space-y-3 p-3">
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-8/12" />
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-5 w-24" />
        <SkeletonBlock className="h-9 w-full rounded-xl" />
      </div>
    </div>);

}

export function ProductGridSkeleton({ count = 8 }) {
  const cardIds = generateSkeletonIds("product-card-skeleton", count);

  return (
    <div className="grid grid-cols-2 gap-5 p-4 md:grid-cols-3 lg:grid-cols-4">
      {cardIds.map((id) =>
      <ProductCardSkeleton key={id} />
      )}
    </div>);

}

export function ProductDetailSkeleton() {
  const thumbRailIds = generateSkeletonIds("thumb-rail-skeleton", 5);
  const mobileThumbIds = generateSkeletonIds("mobile-thumb-skeleton", 5);
  const specIconIds = generateSkeletonIds("spec-icon-skeleton", 4);
  const variantChipIds = generateSkeletonIds("variant-chip-skeleton", 4);
  const detailLineIds = generateSkeletonIds("detail-line-skeleton", 5);

  return (
    <main className="min-h-screen bg-white pb-28 lg:pb-10">
      <div className="mx-auto max-w-[1550px] px-3 py-4 sm:px-4 lg:py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[52px_minmax(480px,5fr)_minmax(360px,4fr)_minmax(280px,3fr)] lg:gap-2 xl:gap-3">
          <div className="hidden lg:block">
            <div className="space-y-2">
              {thumbRailIds.map((id) =>
              <SkeletonBlock key={id} className="h-12 w-12 rounded" />
              )}
            </div>
          </div>

          <div>
            <SkeletonBlock className="h-[360px] w-full sm:h-[460px] lg:h-[560px]" />
            <div className="mt-4 flex gap-2 lg:hidden">
              {mobileThumbIds.map((id) =>
              <SkeletonBlock key={id} className="h-14 w-14 min-w-14 rounded" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <SkeletonBlock className="h-4 w-44" />
            <SkeletonBlock className="h-7 w-full" />
            <SkeletonBlock className="h-7 w-10/12" />
            <SkeletonBlock className="h-4 w-40" />
            <div className="border-y border-gray-200 py-5">
              <SkeletonBlock className="h-8 w-36" />
              <SkeletonBlock className="mt-3 h-4 w-52" />
            </div>
            <div className="grid grid-cols-4 gap-3 border-b border-gray-200 pb-5">
              {specIconIds.map((id) =>
              <div key={id} className="space-y-2">
                  <SkeletonBlock className="mx-auto h-8 w-8 rounded-full" />
                  <SkeletonBlock className="h-3 w-full" />
                </div>
              )}
            </div>
            <SkeletonBlock className="h-5 w-32" />
            <div className="flex gap-2">
              {variantChipIds.map((id) =>
              <SkeletonBlock key={id} className="h-10 w-20 rounded-md" />
              )}
            </div>
            <SkeletonBlock className="h-5 w-40" />
            <div className="space-y-2">
              {detailLineIds.map((id) =>
              <SkeletonBlock key={id} className="h-4 w-full" />
              )}
            </div>
          </div>

          <div>
            <div className="space-y-4 rounded-lg border border-gray-300 p-4">
              <SkeletonBlock className="h-8 w-32" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-6 w-24" />
              <SkeletonBlock className="h-9 w-28 rounded" />
              <SkeletonBlock className="h-10 w-full rounded-full" />
              <SkeletonBlock className="h-10 w-full rounded-full" />
              <SkeletonBlock className="h-10 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>);

}

export function CartSkeleton() {
  const cartItemIds = generateSkeletonIds("cart-item-skeleton", 3);

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-3 py-6 md:px-5">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <SkeletonBlock className="h-7 w-48" />
            <SkeletonBlock className="mt-3 h-4 w-24" />
          </div>
          {cartItemIds.map((id) =>
          <div key={id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex gap-4">
                <SkeletonBlock className="h-28 w-28 flex-shrink-0 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <SkeletonBlock className="h-5 w-10/12" />
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-4 w-40" />
                  <SkeletonBlock className="h-6 w-32" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <SkeletonBlock className="h-28 w-full rounded-2xl" />
          <SkeletonBlock className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    </div>);

}

export default function PageSkeleton({ type = "home" }) {
  if (type === "product") return <ProductDetailSkeleton />;
  if (type === "cart") return <CartSkeleton />;
  if (type === "grid") {
    return (
      <main className="min-h-screen bg-zinc-50">
        <ProductGridSkeleton />
      </main>);

  }

  const bannerTileIds = generateSkeletonIds("banner-tile-skeleton", 4);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-[1450px] px-4 py-6">
        <SkeletonBlock className="h-[260px] w-full rounded-2xl sm:h-[360px]" />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {bannerTileIds.map((id) =>
          <SkeletonBlock key={id} className="h-32 rounded-2xl" />
          )}
        </div>
        <div className="mt-8">
          <SkeletonBlock className="h-7 w-48" />
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </main>);

}
