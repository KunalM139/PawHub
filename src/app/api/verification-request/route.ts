import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";
import { verificationSubmitRateLimit, checkRateLimit } from "@/lib/ratelimit";

const verificationSchema = z.object({
  legalName: z.string().trim().min(2).max(120),
  businessName: z.string().trim().max(120).optional().nullable(),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  idProofUrl: z.string().url(),
  businessProofUrl: z.string().url().optional().nullable(),
  aboutBusiness: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const [request, user] = await Promise.all([
      VerificationRequestModel.findOne({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean(),
      UserModel.findById(session.user.id).select("role").lean(),
    ]);

    return NextResponse.json(
      {
        request,
        role: user?.role ?? "user",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        message: "Unable to fetch verification status.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const rateLimitError = await checkRateLimit(verificationSubmitRateLimit, session.user.id, session.user.role === "admin");
    if (rateLimitError) return rateLimitError;

    const json = await request.json();
    const parsed = verificationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid verification payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existingPending = await VerificationRequestModel.findOne({
      userId: session.user.id,
      status: "pending",
    })
      .select("_id")
      .lean();

    if (existingPending) {
      return NextResponse.json(
        {
          message: "A verification request is already pending.",
        },
        { status: 409 },
      );
    }

    const created = await VerificationRequestModel.create({
      userId: session.user.id,
      legalName: parsed.data.legalName,
      businessName: parsed.data.businessName ?? null,
      phone: parsed.data.phone,
      city: parsed.data.city,
      state: parsed.data.state,
      idProofUrl: parsed.data.idProofUrl,
      businessProofUrl: parsed.data.businessProofUrl ?? null,
      aboutBusiness: parsed.data.aboutBusiness ?? null,
      status: "pending",
    });

    return NextResponse.json({ request: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to submit verification request.",
      },
      { status: 500 },
    );
  }
}
