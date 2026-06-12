const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;

const twilioEnv = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_FROM_NUMBER,
};

export function generateOtpCode(): string {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function getOtpExpiry(minutes: number = OTP_TTL_MINUTES): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isTwilioConfigured(): boolean {
  return Boolean(twilioEnv.accountSid && twilioEnv.authToken && twilioEnv.fromNumber);
}

export async function sendOtpMessage(phone: string, otpCode: string) {
  // Always mock for now to prevent Twilio API errors during testing
  return { mode: "mock" as const };
}
