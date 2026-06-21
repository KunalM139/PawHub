import { NextResponse } from "next/server";
import { z } from "zod";

import { generateOtpCode, getOtpExpiry, sendOtpMessage } from "@/lib/otp";
import { connectToDatabase } from "@/server/db/connect";
import { OtpRequestModel } from "@/server/models/otp-request";
import { otpSendRateLimit, getIp, checkRateLimitWithLog } from "@/lib/ratelimit";

const phoneRegex = /^[0-9+][0-9\s-]{7,19}$/;

const sendOtpSchema = z.object({
  phone: z.string().trim().min(8).max(20).regex(phoneRegex, "Enter a valid phone number."),
});

export async function POST(request: Request) {
  try {
    const ip = getIp(request);
    const rateLimitError = await checkRateLimitWithLog(otpSendRateLimit, `otp_send_${ip}`, "OtpSend");
    if (rateLimitError) return rateLimitError;

    const json = await request.json();
    const parsed = sendOtpSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid phone number.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    // MOCK OTP SYSTEM FOR TESTING (bypass DB)
    const otp = generateOtpCode();

    return NextResponse.json(
      {
        message: "OTP sent.",
        mode: "mock",
        otp: otp,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send OTP.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
