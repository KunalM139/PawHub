import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { generateOtpCode, getOtpExpiry, sendOtpMessage } from "@/lib/otp";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { getIp, checkRateLimitWithLog, otpSendRateLimit } from "@/lib/ratelimit";

const phoneRegex = /^[0-9+][0-9\s-]{7,19}$/;

const sendOtpSchema = z.object({
  phone: z.string().trim().min(8).max(20).regex(phoneRegex, "Enter a valid phone number."),
});

export async function POST(request: Request) {
  try {
    const ip = getIp(request);
    const rateLimitError = await checkRateLimitWithLog(otpSendRateLimit, `otp_send_main_${ip}`, "OtpSendMain");
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

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

    await connectToDatabase();

    const user = await UserModel.findById(session.user.id)
      .select("phone isPhoneVerified")
      .lean();

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (user.isPhoneVerified && user.phone === parsed.data.phone) {
      return NextResponse.json({ message: "Phone already verified." }, { status: 200 });
    }

    const otp = generateOtpCode();
    const otpExpiry = getOtpExpiry();

    await UserModel.findByIdAndUpdate(session.user.id, {
      $set: {
        phone: parsed.data.phone,
        otp,
        otpExpiry,
        isPhoneVerified: false,
      },
    });

    const sendResult = await sendOtpMessage(parsed.data.phone, otp);

    const includeOtp = sendResult.mode === "mock" && process.env.NODE_ENV !== "production";

    return NextResponse.json(
      {
        message: "OTP sent.",
        mode: sendResult.mode,
        otp: includeOtp ? otp : undefined,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send OTP.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
