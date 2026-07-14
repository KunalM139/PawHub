import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";
import { verificationSubmitRateLimit, checkRateLimit } from "@/lib/ratelimit";
import { notifyAdmins } from "@/lib/notify-admins";

const verificationSchema = z.object({
  legalName: z.string().trim().min(2).max(120),
  businessName: z.string().trim().max(120).optional().nullable(),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/),
  dateOfBirth: z.string().or(z.date()),
  storeName: z.string().trim().min(2).max(100),
  address: z.string().trim().max(500),
  pincode: z.string().trim().max(20),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  idProofUrl: z.string().min(1),
  businessProofUrl: z.string().min(1).optional().nullable(),
  aboutBusiness: z.string().trim().max(1000).optional().nullable(),
  gstNumber: z.string().trim().max(50).optional().nullable(),
  businessRegistrationNumber: z.string().trim().max(100).optional().nullable(),
  selfieUrl: z.string().min(1).optional().nullable(),
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
      UserModel.findById(session.user.id).select("role verificationStatus storeName").lean(),
    ]);

    return NextResponse.json(
      {
        request,
        role: user?.role ?? "user",
        storeName: user?.storeName,
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

    // Store Name Uniqueness Check
    const existingStore = await UserModel.findOne({
      _id: { $ne: session.user.id },
      storeName: { $regex: new RegExp(`^${parsed.data.storeName}$`, "i") },
    }).lean();

    if (existingStore) {
      return NextResponse.json({ message: "This Store Name is already taken." }, { status: 409 });
    }

    const existingRequest = await VerificationRequestModel.findOne({
      userId: session.user.id,
    });

    if (existingRequest && existingRequest.status === "pending") {
      return NextResponse.json(
        {
          message: "A verification request is already pending.",
        },
        { status: 409 },
      );
    }

    const payload = {
      legalName: parsed.data.legalName,
      businessName: parsed.data.businessName ?? null,
      phone: parsed.data.phone,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      storeName: parsed.data.storeName,
      address: parsed.data.address,
      pincode: parsed.data.pincode,
      city: parsed.data.city,
      state: parsed.data.state,
      idProofUrl: parsed.data.idProofUrl,
      businessProofUrl: parsed.data.businessProofUrl ?? null,
      aboutBusiness: parsed.data.aboutBusiness ?? null,
      gstNumber: parsed.data.gstNumber ?? null,
      businessRegistrationNumber: parsed.data.businessRegistrationNumber ?? null,
      selfieUrl: parsed.data.selfieUrl ?? null,
      status: "pending",
    };

    const historyEntry = {
      action: existingRequest ? "resubmitted" : "submitted",
      timestamp: new Date(),
    };

    let resultRequest;

    if (existingRequest && (existingRequest.status === "rejected" || existingRequest.status === "more_info_required")) {
      existingRequest.set(payload);
      existingRequest.history.push(historyEntry);
      resultRequest = await existingRequest.save();

      await UserModel.findByIdAndUpdate(session.user.id, {
        $set: { verificationStatus: "pending" },
        $inc: { verificationResubmissionCount: 1 },
      });
    } else {
      resultRequest = await VerificationRequestModel.create({
        userId: session.user.id,
        ...payload,
        history: [historyEntry],
      });

      await UserModel.findByIdAndUpdate(session.user.id, {
        $set: { verificationStatus: "pending" },
      });
    }

    await notifyAdmins(
      "New Verification Request",
      \`\${parsed.data.storeName} has submitted a verification request.\`,
      "/admin/verification-requests"
    );

    return NextResponse.json({ request: resultRequest }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: err?.message || "Unable to submit verification request.",
      },
      { status: 500 },
    );
  }
}
