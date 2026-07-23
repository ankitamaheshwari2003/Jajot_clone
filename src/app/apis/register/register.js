import { api } from "../baseurl/baseurl";

// Registers a vendor through the backend user API.
export const registerVendor = (vendorData) => {
  return api.post("/users/register", { ...vendorData, role: "vendor" });
};

// Sends a vendor registration OTP through the backend user API.
export const sendVendorOtp = (email) => {
  return api.post("/users/send-otp", { email, role: "vendor" }, { timeout: 30000 });
};

// Verifies a vendor OTP through the backend user API.
export const verifyVendorOtp = ({ email, otp }) => {
  return api.post("/users/verify-otp", { email, otp, role: "vendor" });
};

// Resends a vendor OTP through the backend user API.
export const resendVendorOtp = (email) => {
  return api.post("/users/resend-otp", { email, role: "vendor" });
};
