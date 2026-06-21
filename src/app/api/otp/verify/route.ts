import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { UserModel } from "@/server/models/user";
import { otpVerifyRateLimit, getIp, checkRateLimitWithLog } from "@/lib/ratelimit";

const verifyOtpSchema = z.object({
  otp: z.string().trim().length(6, "OTP must be exactly 6 digits."),
});

export async function POST(request: Request) {
  try {
    const ip = getIp(request);
    const rateLimitError = await checkRateLimitWithLog(otpVerifyRateLimit, `otp_verify_main_${ip}`, "OtpVerifyMain");
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

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

    await connectToDatabase();

    const user = await UserModel.findById(session.user.id)
      .select("otp otpExpiry isPhoneVerified")
      .lean();

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (user.isPhoneVerified) {
      return NextResponse.json({ message: "Phone already verified." }, { status: 200 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ message: "No OTP request found." }, { status: 400 });
    }

    if (user.otp !== parsed.data.otp) {
      return NextResponse.json({ message: "Incorrect OTP." }, { status: 400 });
    }

    if (new Date(user.otpExpiry).getTime() < Date.now()) {
      return NextResponse.json({ message: "OTP expired. Please request a new one." }, { status: 400 });
    }

    await UserModel.findByIdAndUpdate(session.user.id, {
      $set: {
        isPhoneVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    await ListingModel.updateMany(
      { sellerId: session.user.id },
      {
        $set: {
          isPhoneVerified: true,
        },
      },
    );

    return NextResponse.json({ message: "Phone verified." }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to verify OTP." }, { status: 500 });
  }
}
