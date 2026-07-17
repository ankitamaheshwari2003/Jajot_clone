import axios from "axios";

const WHATSAPP_OTP_API_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_OTP_API_URL || "/api/send-whatsapp-otp";

export const sendWhatsAppOtp = (number) => {
  return axios.post(WHATSAPP_OTP_API_URL, { number });
};
