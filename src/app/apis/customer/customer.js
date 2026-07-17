const idKeys = ["cid", "customerId", "userId", "_id", "id"];
const userObjectKeys = [
  "data",
  "user",
  "customer",
  "enduser",
  "endUser",
  "finduser",
  "findUser",
  "result",
];

const findIdInObject = (value, visited = new Set()) => {
  if (!value || typeof value !== "object" || visited.has(value)) return null;
  visited.add(value);

  for (const key of idKeys) {
    if (value[key]) return value[key];
  }

  for (const key of userObjectKeys) {
    const nestedId = findIdInObject(value[key], visited);
    if (nestedId) return nestedId;
  }

  return null;
};

export const extractCustomerId = (data) => findIdInObject(data);

export const getLoggedInCid = () => {
  if (typeof window === "undefined") return null;

  const savedCid = localStorage.getItem("cid");
  if (savedCid) return savedCid;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return extractCustomerId(user);
  } catch {
    return null;
  }
};

export const saveCustomerSession = (data) => {
  if (typeof window === "undefined") return null;

  localStorage.setItem("user", JSON.stringify(data));

  const token = data?.token || data?.data?.token || data?.user?.token;
  if (token) localStorage.setItem("userToken", token);

  const cid = extractCustomerId(data);
  if (cid) {
    localStorage.setItem("cid", cid);
    localStorage.setItem("userId", cid);
  }

  return cid;
};

// ---------- NAYA CODE: AddressForm autofill ke liye ----------

const nameKeys = ["fullName", "name", "customerName", "userName"];
const mobileKeys = [
  "mobile",
  "mobileNo",
  "mobileNumber",
  "phone",
  "phoneNumber",
  "contact",
  "contactNumber",
];
const emailKeys = ["email", "emailId", "emailAddress"];
const addressObjectKeys = [
  "address",
  "shippingAddress",
  "defaultAddress",
  "savedAddress",
];

const findFieldInObject = (value, fieldKeys, visited = new Set()) => {
  if (!value || typeof value !== "object" || visited.has(value)) return null;
  visited.add(value);

  for (const key of fieldKeys) {
    if (value[key]) return value[key];
  }

  for (const key of userObjectKeys) {
    const nested = findFieldInObject(value[key], fieldKeys, visited);
    if (nested) return nested;
  }

  return null;
};

const findAddressInObject = (value, visited = new Set()) => {
  if (!value || typeof value !== "object" || visited.has(value)) return null;
  visited.add(value);

  for (const key of addressObjectKeys) {
    if (value[key] && typeof value[key] === "object") return value[key];
  }

  for (const key of userObjectKeys) {
    const nested = findAddressInObject(value[key], visited);
    if (nested) return nested;
  }

  return null;
};


export const getLoggedInCustomerInfo = () => {
  if (typeof window === "undefined") return null;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return null;

    const address = findAddressInObject(user) || {};

    return {
      fullName: findFieldInObject(user, nameKeys) || "",
      mobile: findFieldInObject(user, mobileKeys) || "",
      email: findFieldInObject(user, emailKeys) || "",
      pincode: address.pincode || address.pinCode || address.zip || "",
      houseNumber: address.houseNumber || address.house || "",
      area: address.area || address.street || address.addressLine1 || "",
      locality: address.locality || address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      landmark: address.landmark || "",
    };
  } catch {
    return null;
  }
};