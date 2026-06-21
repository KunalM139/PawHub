import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/server/db/connect";
import { OtpRequestModel } from "@/server/models/otp-request";
import { otpVerifyRateLimit, getIp, checkRateLimitWithLog } from "@/lib/ratelimit";

const verifyOtpSchema = z.object({
  phone: z.string().trim().min(8).max(20),
  otp: z.string().trim().length(6, "Enter the 6-digit OTP."),
});

export async function POST(request: Request) {
  try {
    const ip = getIp(request);
    const rateLimitError = await checkRateLimitWithLog(otpVerifyRateLimit, `otp_verify_${ip}`, "OtpVerify");
    if (rateLimitError) return rateLimitError;

    const json = await request.json();
    const parsed = verifyOtpSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid OTP.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    // MOCK OTP SYSTEM FOR TESTING (bypass DB)
    // Accept any 6-digit OTP that passes schema validation
    return NextResponse.json({ message: "Phone verified (Mock Mode)." }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to verify OTP." }, { status: 500 });
  }
}
