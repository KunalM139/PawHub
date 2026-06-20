import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/password";
import { authRateLimit } from "@/lib/ratelimit";
import { connectToDatabase } from "@/server/db/connect";
import { OtpRequestModel } from "@/server/models/otp-request";
import { UserModel } from "@/server/models/user";

const phoneRegex = /^[0-9+][0-9\s-]{7,19}$/;

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  phone: z.string().trim().min(8).max(20).regex(phoneRegex),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  userIntent: z.enum(["adopt", "rehome", "seller"]),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await authRateLimit.limit(`register_${ip}`);
    if (!success) {
      return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429 });
    }

    const json = await request.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid input data.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: parsed.data.email }).select("_id").lean();

    if (existingUser) {
      return NextResponse.json({ message: "Email already registered." }, { status: 409 });
    }

    // MOCK: Bypass OTP DB validation
    // if (!otpRecord || !otpRecord.verified) {
    //   return NextResponse.json(
    //     { message: "Please verify your phone number with OTP." },
    //     { status: 400 },
    //   );
    // }

    // if (new Date(otpRecord.otpExpiry).getTime() < Date.now()) {
    //   return NextResponse.json(
    //     { message: "OTP verification expired. Please request a new code." },
    //     { status: 400 },
    //   );
    // }

    const hashedPassword = await hashPassword(parsed.data.password);

    const userType = parsed.data.userIntent === "seller" ? "seller" : "petOwner";

    await UserModel.create({
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      phone: parsed.data.phone,
      city: parsed.data.city,
      state: parsed.data.state,
      userIntent: parsed.data.userIntent,
      userType,
      isPhoneVerified: true,
      role: "user",
    });

    // await OtpRequestModel.deleteOne({ phone: parsed.data.phone });

    return NextResponse.json(
      {
        message: "Account created successfully.",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        message: "Unable to create account. Please try again.",
      },
      { status: 500 },
    );
  }
}
