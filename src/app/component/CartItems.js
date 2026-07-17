import { Package, Truck } from "lucide-react";

export default function CartItems({ items = [] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
      <h2 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mb-2">
        Review items and shipping
      </h2>

      {items.map((item, index) => {
        const quantity = item.qty || item.quantity || 1;
        const price =
        typeof item.price === "number" ?
        item.price :
        Number(String(item.price).replace(/[^\d]/g, "")) || 0;

        return (
          <div
            key={item.id || index}
            className={`flex gap-3 py-4 ${
            index < items.length - 1 ? "border-b border-gray-100" : ""}`
            }>
            
            <div className="w-16 h-16 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
              {item.image ?
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover" /> :


              <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-7 w-7 text-[#FF9900]" />
                </div>
              }
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#007185] hover:underline cursor-pointer line-clamp-2 mb-1">
                {item.name}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                In Stock · Qty: {quantity}
              </p>
              <p className="text-sm font-medium text-gray-900">
                ₹{(price * quantity).toLocaleString("en-IN")}
                {item.originalPrice &&
                <s className="text-xs text-gray-400 font-normal ml-2">
                    ₹{item.originalPrice.toLocaleString("en-IN")}
                  </s>
                }
              </p>
              <p className="text-xs text-green-700 mt-1 flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-[#FF9900]" />
                FREE Delivery Tomorrow
              </p>
            </div>
          </div>);

      })}
    </div>);

}
