import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { forgotPasswordRateLimit, getIp, checkRateLimitWithLog } from "@/lib/ratelimit";

const forgotPasswordSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
});

export async function POST(request: Request) {
  try {
    const ip = getIp(request);
    const rateLimitError = await checkRateLimitWithLog(forgotPasswordRateLimit, `forgot_password_${ip}`, "ForgotPassword");
    if (rateLimitError) return rateLimitError;

    const json = await request.json();
    const parsed = forgotPasswordSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid email." }, { status: 400 });
    }

    await connectToDatabase();

    await UserModel.findOne({ email: parsed.data.email }).select("_id").lean();

    return NextResponse.json(
      {
        message:
          "If the email exists in our system, you'll receive reset instructions shortly.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        message: "Unable to process request. Please try again.",
      },
      { status: 500 },
    );
  }
}
