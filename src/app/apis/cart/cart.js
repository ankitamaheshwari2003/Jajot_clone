import { api } from "../baseurl/baseurl";
import { getLoggedInCid } from "../customer/customer";

// Returns a stable device id used for anonymous cart API requests.
export function getCartDeviceId() {
  if (typeof window === "undefined") return "";

  try {
    let deviceId = localStorage.getItem("deviceId");

    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }

    return deviceId;
  } catch (err) {
    console.warn("getCartDeviceId failed:", err?.message);
    return "";
  }
}

// Normalizes any cart API response into a plain cart item array.
export function getApiCartList(payload) {
  try {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.cart)) return payload.cart;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data?.cart)) return payload.data.cart;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;

    return [];
  } catch {
    return [];
  }
}

const makeEmptyCartResponse = (message = "") => ({
  data: {
    success: true,
    data: [],
    ...(message ? { message } : {}),
  },
});

const makeCartResponse = (items = []) => ({
  data: {
    success: true,
    data: Array.isArray(items) ? items : [],
  },
});

const is404 = (err) => err?.response?.status === 404;
const is401 = (err) => err?.response?.status === 401;

function getApiErrorMessage(err, fallback = "Cart request failed") {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

// Returns the best product id available on a cart item.
export function getCartProductId(item) {
  const product =
    item?.pid ||
    item?.productId ||
    item?.product_id ||
    item?.product ||
    item?.id;

  return typeof product === "object"
    ? product?._id || product?.id || null
    : product || null;
}

// Returns the best variant id available on a cart item.
export function getCartVariantId(item) {
  const variant =
    item?.variantId ||
    item?.variant_id ||
    item?.variant;

  return typeof variant === "object"
    ? variant?._id || variant?.id || null
    : variant || null;
}

// Returns the best vendor id available on a cart item.
export function getCartVendorId(item) {
  const vendor =
    item?.vendorId ||
    item?.venderid ||
    item?.vendor_id ||
    item?.vendor ||
    (item?.pid && typeof item.pid === "object"
      ? item.pid.vendorId
      : null) ||
    (item?.productId && typeof item.productId === "object"
      ? item.productId.vendorId
      : null) ||
    (item?.variantId && typeof item.variantId === "object"
      ? item.variantId.vendorId
      : null);

  return typeof vendor === "object"
    ? vendor?._id || vendor?.id || null
    : vendor || null;
}

// Returns the cart item's stable product or variant key.
export function getCartProductKey(item) {
  return (
    getCartProductId(item) ||
    getCartVariantId(item) ||
    item?._id ||
    null
  );
}

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function isValidObjectId(value) {
  return typeof value === "string" && OBJECT_ID_REGEX.test(value);
}

function extractId(value) {
  if (!value) return "";
  const id = typeof value === "object" ? value?._id || value?.id || "" : String(value);
  return isValidObjectId(id) ? id : "";
}

// Returns a valid category ObjectId from a cart item when one exists.
export function getCartCategoryId(item) {
  return extractId(
    item?.categoryId ||
    (item?.pid && typeof item.pid === "object" ? item.pid.categoryId : null) ||
    (item?.productId && typeof item.productId === "object" ? item.productId.categoryId : null)
  );
}

// Returns a valid subcategory ObjectId from a cart item when one exists.
export function getCartSubcategoryId(item) {
  return extractId(
    item?.subcategoryId ||
    item?.subCategoryId ||
    (item?.pid && typeof item.pid === "object" ? item.pid.subcategoryId : null) ||
    (item?.productId && typeof item.productId === "object" ? item.productId.subcategoryId : null)
  );
}

// Returns a valid sub-to-subcategory ObjectId from a cart item when one exists.
export function getCartSubToSubcategoryId(item) {
  return extractId(
    item?.subtosubcategoryId ||
    item?.subtosubcategoryid ||
    (item?.pid && typeof item.pid === "object" ? item.pid.subtosubcategoryId : null) ||
    (item?.productId && typeof item.productId === "object" ? item.productId.subtosubcategoryId : null)
  );
}

// Builds the backend payload used to update an existing cart item.
export function buildCartUpdatePayload(
  item,
  cid = getLoggedInCid(),
  qty = item?.qty || item?.quantity || 1
) {
  return {
    cid,
    pid: getCartProductId(item),
    divid: item?.divid || item?.deviceId || getCartDeviceId(),
    qty,
    variantId: getCartVariantId(item),
    offerDiscount: item?.offerDiscount || item?.discount || 0,
    venderid: getCartVendorId(item),
  };
}

// Creates a cart item through the backend cart API.
export async function createCartItem({
  divid,
  cid = getLoggedInCid(),
  pid = null,
  qty = 1,
  variantId = null,
  offerDiscount = 0,
  vendorId = null,
  categoryId = "",
  subcategoryId = "",
  subtosubcategoryId = "",
} = {}) {
  const finalDivid = divid || getCartDeviceId();

  const validCategoryId = extractId(categoryId);
  const validSubcategoryId = extractId(subcategoryId);
  const validSubToSubcategoryId = extractId(subtosubcategoryId);

  const payload = {
    cid: cid || null,
    pid,
    divid: finalDivid,
    qty,
    variantId,
    offerDiscount,
    venderid: vendorId,
  };

  if (validCategoryId) payload.categoryId = validCategoryId;
  if (validSubcategoryId) payload.subcategoryId = validSubcategoryId;
  if (validSubToSubcategoryId) payload.subtosubcategoryId = validSubToSubcategoryId;

  return api.post("/cart/create", payload);
}

// Updates a cart item through the backend cart API.
export async function updateCartItem(id, data = {}) {
  if (!id) {
    return makeEmptyCartResponse();
  }

  const validCategoryId = extractId(data.categoryId);
  const validSubcategoryId = extractId(data.subcategoryId);
  const validSubToSubcategoryId = extractId(data.subtosubcategoryId);

  const payload = {
    cid: data.cid ?? getLoggedInCid() ?? null,
    pid: data.pid ?? getCartProductId(data),
    divid:
      data.divid ||
      data.deviceId ||
      getCartDeviceId(),
    qty: data.qty ?? data.quantity ?? 1,
    variantId:
      data.variantId ??
      getCartVariantId(data),
    offerDiscount:
      data.offerDiscount ??
      data.discount ??
      0,
    venderid:
      data.vendorId ??
      data.venderid ??
      getCartVendorId(data),
  };

  if (validCategoryId) payload.categoryId = validCategoryId;
  if (validSubcategoryId) payload.subcategoryId = validSubcategoryId;
  if (validSubToSubcategoryId) payload.subtosubcategoryId = validSubToSubcategoryId;

  try {
    return await api.put(`/cart/update/${id}`, payload);
  } catch (err) {
    if (is401(err)) {
      return makeEmptyCartResponse("Unauthorized");
    }

    if (is404(err)) {
      return makeEmptyCartResponse();
    }

    console.warn(
      "updateCartItem failed:",
      id,
      getApiErrorMessage(err)
    );

    throw err;
  }
}

// Deletes a cart item through the backend cart API.
export async function deleteCartItem(id) {
  if (!id) {
    return makeEmptyCartResponse();
  }

  try {
    return await api.delete(`/cart/delete/${id}`);
  } catch (err) {
    if (is401(err)) {
      return makeEmptyCartResponse("Unauthorized");
    }

    if (is404(err)) {
      return makeEmptyCartResponse();
    }

    console.warn(
      "deleteCartItem failed:",
      id,
      getApiErrorMessage(err)
    );

    throw err;
  }
}

// Removes a cart item from an in-memory list without calling the backend.
export function removeCartItemLocally(items = [], id) {
  if (!Array.isArray(items) || !id) return items;

  return items.filter(
    (item) => String(item?._id) !== String(id)
  );
}

// Fetches all cart items from the backend cart API.
export async function getAllCartItems() {
  try {
    return await api.get("/cart/");
  } catch (err) {
    if (is401(err)) {
      return makeEmptyCartResponse("Unauthorized");
    }

    return makeEmptyCartResponse();
  }
}

// Fetches cart items for the logged-in customer from the backend cart API.
export async function getCustomerCartItems(
  cid = getLoggedInCid()
) {
  if (!cid) {
    return makeEmptyCartResponse();
  }

  try {
    return await api.get(`/cart/customer/${cid}`, {
      params: {
        _t: Date.now(),
      },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
  } catch (err) {
    if (is401(err)) {
      console.warn(
        "Customer cart unauthorized. Token was rejected by backend."
      );

      return makeEmptyCartResponse("Unauthorized");
    }

    if (is404(err)) {
      return makeEmptyCartResponse();
    }

    console.warn(
      "getCustomerCartItems failed:",
      getApiErrorMessage(err)
    );

    return makeEmptyCartResponse();
  }
}

// Fetches cart items for the anonymous device from the backend cart API.
export async function getDeviceCartItems(
  divid = getCartDeviceId()
) {
  if (!divid) {
    return makeEmptyCartResponse();
  }

  try {
    return await api.get(`/cart/device/${divid}`, {
      params: {
        _t: Date.now(),
      },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
  } catch (err) {
    if (is401(err)) {
      console.warn(
        "Device cart unauthorized. Token was rejected by backend."
      );

      return makeEmptyCartResponse("Unauthorized");
    }

    if (is404(err)) {
      return makeEmptyCartResponse();
    }

    console.warn(
      "getDeviceCartItems failed:",
      getApiErrorMessage(err)
    );

    return makeEmptyCartResponse();
  }
}

// Fetches the active cart by preferring customer cart data over device cart data.
export async function getCartItems({
  cid = getLoggedInCid(),
  divid = getCartDeviceId(),
} = {}) {
  if (cid) {
    const customerRes = await getCustomerCartItems(cid);
    const customerItems = getApiCartList(
      customerRes?.data
    );

    return makeCartResponse(customerItems);
  }

  if (divid) {
    const deviceRes = await getDeviceCartItems(divid);
    const deviceItems = getApiCartList(
      deviceRes?.data
    );

    return makeCartResponse(deviceItems);
  }

  return makeEmptyCartResponse();
}

// Fetches cart items and adds resolved vendor ids for UI and checkout use.
export async function fetchNormalizedCartItems({
  cid = getLoggedInCid(),
  divid = getCartDeviceId(),
} = {}) {
  try {
    const res = await getCartItems({
      cid,
      divid,
    });

    const items = getApiCartList(res?.data);

    return items.map((item) => ({
      ...item,
      resolvedVendorId: getCartVendorId(item),
    }));
  } catch (err) {
    console.warn(
      "fetchNormalizedCartItems failed:",
      getApiErrorMessage(err)
    );

    return [];
  }
}

// Migrates anonymous device cart items into the logged-in customer cart.
export async function syncDeviceCartToCustomer(
  cid,
  divid = getCartDeviceId()
) {
  if (!cid || !divid) {
    return {
      success: false,
      message: "cid/divid missing",
    };
  }

  try {
    const deviceRes = await getDeviceCartItems(divid);
    const deviceItems = getApiCartList(deviceRes?.data);

    if (deviceItems.length === 0) {
      return {
        success: true,
        migrated: 0,
      };
    }

    const customerRes = await getCustomerCartItems(cid);
    const customerItems = getApiCartList(
      customerRes?.data
    );

    const findMatchingCustomerItem = (item) => {
      const pid = getCartProductId(item);
      const variantId = getCartVariantId(item);

      return customerItems.find(
        (customerItem) =>
          String(getCartProductId(customerItem)) ===
            String(pid) &&
          String(getCartVariantId(customerItem)) ===
            String(variantId)
      );
    };

    let migratedCount = 0;

    for (const item of deviceItems) {
      try {
        const existing =
          findMatchingCustomerItem(item);

        const qty =
          item?.qty ||
          item?.quantity ||
          1;

        const vendorId =
          getCartVendorId(item);

        if (existing) {
          await updateCartItem(existing._id, {
            cid,
            pid: getCartProductId(existing),
            variantId:
              getCartVariantId(existing),
            divid,
            qty:
              (existing?.qty ||
                existing?.quantity ||
                0) + qty,
            offerDiscount:
              existing?.offerDiscount ||
              existing?.discount ||
              0,
            vendorId:
              getCartVendorId(existing) ||
              vendorId,
            categoryId: getCartCategoryId(existing) || getCartCategoryId(item),
            subcategoryId: getCartSubcategoryId(existing) || getCartSubcategoryId(item),
            subtosubcategoryId:
              getCartSubToSubcategoryId(existing) || getCartSubToSubcategoryId(item),
          });
        } else {
          await createCartItem({
            cid,
            pid: getCartProductId(item),
            variantId:
              getCartVariantId(item),
            divid,
            qty,
            offerDiscount:
              item?.offerDiscount ||
              item?.discount ||
              0,
            vendorId,
            categoryId: getCartCategoryId(item),
            subcategoryId: getCartSubcategoryId(item),
            subtosubcategoryId: getCartSubToSubcategoryId(item),
          });
        }

        if (item?._id) {
          await deleteCartItem(item._id);
        }

        migratedCount += 1;
      } catch (itemErr) {
        console.warn(
          "Cart item migrate failed:",
          item?._id,
          getApiErrorMessage(itemErr)
        );
      }
    }

    return {
      success: true,
      migrated: migratedCount,
    };
  } catch (err) {
    console.warn(
      "syncDeviceCartToCustomer failed:",
      getApiErrorMessage(err)
    );

    return {
      success: false,
      message:
        getApiErrorMessage(err, "sync failed"),
    };
  }
}
