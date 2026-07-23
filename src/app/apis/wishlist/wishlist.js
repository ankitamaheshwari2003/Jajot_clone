import { api } from "../baseurl/baseurl";
import { getLoggedInCid } from "../customer/customer";

// Returns a stable device id used for anonymous wishlist API requests.
export function getWishlistDeviceId() {
  if (typeof window === "undefined") return "";

  try {
    let deviceId = localStorage.getItem("deviceId");

    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }

    return deviceId;
  } catch (err) {
    console.warn("getWishlistDeviceId failed:", err?.message);
    return "";
  }
}

// Normalizes any wishlist API response into a plain wishlist item array.
export function getApiWishlistList(payload) {
  try {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.wishlist)) return payload.wishlist;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data?.wishlist)) return payload.data.wishlist;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;
    return [];
  } catch {
    return [];
  }
}

const makeEmptyWishlistResponse = () => ({
  data: {
    success: true,
    data: []
  }
});

const makeWishlistResponse = (items = []) => ({
  data: {
    success: true,
    data: items
  }
});

const is404 = (err) => err?.response?.status === 404;

// Returns the best product id available on a wishlist item.
export function getWishlistProductId(item) {
  const product =
  item?.pid ||
  item?.productId ||
  item?.product_id ||
  item?.product ||
  item?.id;

  return typeof product === "object" ? product?._id || null : product || null;
}

// Returns the best variant id available on a wishlist item.
export function getWishlistVariantId(item) {
  const variant = item?.variantId || item?.variant_id || item?.variant;

  return typeof variant === "object" ? variant?._id || null : variant || null;
}

// Returns the best vendor id available on a wishlist item.
export function getWishlistVendorId(item) {
  const vendor =
  item?.vendorId ||
  item?.venderid ||
  item?.vendor_id ||
  item?.vendor || (
  item?.pid && typeof item.pid === "object" ? item.pid.vendorId : null) || (
  item?.productId && typeof item.productId === "object" ?
  item.productId.vendorId :
  null) || (
  item?.variantId && typeof item.variantId === "object" ?
  item.variantId.vendorId :
  null);

  return typeof vendor === "object" ? vendor?._id || null : vendor || null;
}

function dispatchWishlistUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("wishlistUpdated"));
}



// Creates a wishlist item through the backend wishlist API.
export async function createWishlistItem({
  cid = getLoggedInCid(),
  pid = null,
  variantId = null,
  vendorId = null,
  qty = 1,
  offerDiscount = 0,
  divid
} = {}) {
  const finalDivid = divid || getWishlistDeviceId();

  const payload = {
    cid,
    pid,
    divid: finalDivid,
    qty,
    variantId,
    offerDiscount,
    venderid: vendorId
  };



  const res = await api.post("/wishrlist/create", payload);

  dispatchWishlistUpdated();

  return res;
}

export const addWishlistItem = createWishlistItem;



// Updates a wishlist item through the backend wishlist API.
export async function updateWishlistItem(id, data = {}) {
  if (!id) {
    return makeEmptyWishlistResponse();
  }

  const payload = {
    cid: data.cid ?? getLoggedInCid(),
    pid: data.pid ?? getWishlistProductId(data),
    divid: data.divid || data.deviceId || getWishlistDeviceId(),
    qty: data.qty ?? data.quantity ?? 1,
    variantId: data.variantId ?? getWishlistVariantId(data),
    offerDiscount: data.offerDiscount ?? data.discount ?? 0,
    venderid: data.vendorId ?? getWishlistVendorId(data)
  };

  try {
    const res = await api.put(`/wishrlist/update/${id}`, payload);
    dispatchWishlistUpdated();
    return res;
  } catch (err) {
    if (is404(err)) {
      return makeEmptyWishlistResponse();
    }

    console.error("updateWishlistItem failed:", id, err?.message);
    throw err;
  }
}



// Deletes a wishlist item through the backend wishlist API.
export async function deleteWishlistItem(id) {
  if (!id) {
    return makeEmptyWishlistResponse();
  }

  try {
    const res = await api.delete(`/wishrlist/delete/${id}`);
    dispatchWishlistUpdated();
    return res;
  } catch (err) {
    if (is404(err)) {
      return makeEmptyWishlistResponse();
    }

    console.error("deleteWishlistItem failed:", id, err?.message);
    throw err;
  }
}

export const removeWishlistItem = deleteWishlistItem;





// Fetches wishlist items for the logged-in customer from the backend API.
export async function getCustomerWishlistItems(cid = getLoggedInCid()) {
  if (!cid) {
    return makeEmptyWishlistResponse();
  }

  try {

    return await api.get(`/wishrlist`, {
      params: { cid, _t: Date.now() },
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" }
    });
  } catch (err) {
    if (is404(err)) {
      return makeEmptyWishlistResponse();
    }

    return makeEmptyWishlistResponse();
  }
}

// Fetches wishlist items for the anonymous device from the backend API.
export async function getDeviceWishlistItems(divid = getWishlistDeviceId()) {
  if (!divid) {
    return makeEmptyWishlistResponse();
  }

  try {
    return await api.get(`/wishrlist/device/${divid}`, {
      params: { _t: Date.now() },
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" }
    });
  } catch (err) {
    if (is404(err)) {
      return makeEmptyWishlistResponse();
    }

    return makeEmptyWishlistResponse();
  }
}




// Fetches the active wishlist by preferring customer data over device data.
export async function getWishlistItems({
  cid = getLoggedInCid(),
  divid = getWishlistDeviceId()
} = {}) {
  try {
    if (cid) {
      const customerRes = await getCustomerWishlistItems(cid);
      const customerItems = getApiWishlistList(customerRes.data);
      return makeWishlistResponse(customerItems);
    }

    if (divid) {
      const deviceRes = await getDeviceWishlistItems(divid);
      const deviceItems = getApiWishlistList(deviceRes.data);
      return makeWishlistResponse(deviceItems);
    }

    return makeEmptyWishlistResponse();
  } catch {
    return makeEmptyWishlistResponse();
  }
}

// Fetches the active wishlist for the current customer or device.
export async function getAllWishlistItems() {
  return getWishlistItems();
}

export const getWishlistByCidOrDevice = getWishlistItems;





// Migrates anonymous device wishlist items into the logged-in customer wishlist.
export async function syncDeviceWishlistToCustomer(
cid,
divid = getWishlistDeviceId())
{
  if (!cid || !divid) {
    return {
      success: false,
      message: "cid/divid missing"
    };
  }

  try {
    const deviceRes = await getDeviceWishlistItems(divid);
    const deviceItems = getApiWishlistList(deviceRes.data);

    if (deviceItems.length === 0) {
      return {
        success: true,
        migrated: 0
      };
    }

    const customerRes = await getCustomerWishlistItems(cid);
    const customerItems = getApiWishlistList(customerRes.data);

    const findMatchingCustomerItem = (item) => {
      const pid = getWishlistProductId(item);
      const variantId = getWishlistVariantId(item);

      return customerItems.find(
        (ci) =>
        String(getWishlistProductId(ci)) === String(pid) &&
        String(getWishlistVariantId(ci)) === String(variantId)
      );
    };

    let migratedCount = 0;

    for (const item of deviceItems) {
      try {
        const existing = findMatchingCustomerItem(item);

        if (!existing) {
          const vendorId = getWishlistVendorId(item);

          await createWishlistItem({
            cid,
            pid: getWishlistProductId(item),
            variantId: getWishlistVariantId(item),
            divid,
            qty: item?.qty || item?.quantity || 1,
            offerDiscount: item?.offerDiscount || item?.discount || 0,
            vendorId
          });
        }

        if (item?._id) {
          await deleteWishlistItem(item._id);
        }

        migratedCount++;
      } catch (itemErr) {
        console.warn(
          "Wishlist item migrate failed:",
          item?._id,
          itemErr?.message
        );
      }
    }

    dispatchWishlistUpdated();

    return {
      success: true,
      migrated: migratedCount
    };
  } catch (err) {
    console.warn("syncDeviceWishlistToCustomer failed:", err?.message);

    return {
      success: false,
      message: err?.message || "sync failed"
    };
  }
}
