const OTP_EXPIRY_MINUTES = 5;

const normalizeWhatsAppNumber = (number) => {
  const digits = String(number || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
};

const generateOtp = () => {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(100000 + (values[0] % 900000));
};

export async function POST(request) {
  try {
    const body = await request.json();
    const whatsappNumber = normalizeWhatsAppNumber(body.number);

    if (whatsappNumber.length < 11 || whatsappNumber.length > 15) {
      return Response.json(
        {
          success: false,
          message: "Valid WhatsApp number bhejo.",
        },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    const message = `Your Jajot OTP is ${otp}. It is valid for ${OTP_EXPIRY_MINUTES} minutes.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    return Response.json({
      success: true,
      whatsappUrl,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "WhatsApp OTP API failed.",
      },
      { status: 500 }
    );
  }
}
