import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { connectToDatabase } from "@/server/db/connect";
import { FavoriteModel } from "@/server/models/favorite";
import { ListingModel } from "@/server/models/listing";
import { MessageModel } from "@/server/models/message";
import { ReviewModel } from "@/server/models/review";
import { UserModel } from "@/server/models/user";

const phoneRegex = /^[0-9+][0-9\s-]{7,19}$/;

const optionalText = z.string().trim().transform((value) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
});

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().transform((value) => value.toLowerCase()).optional(),
  image: z.string().url().nullable().optional(),
  phone: optionalText
    .refine((value) => value === null || phoneRegex.test(value), {
      message: "Enter a valid phone number.",
    })
    .optional(),
  city: optionalText
    .refine((value) => value === null || value.length <= 80, {
      message: "City must be at most 80 characters.",
    })
    .optional(),
  state: optionalText
    .refine((value) => value === null || value.length <= 80, {
      message: "State must be at most 80 characters.",
    })
    .optional(),
  bio: optionalText
    .refine((value) => value === null || value.length <= 280, {
      message: "Bio must be at most 280 characters.",
    })
    .optional(),
  newPassword: z.string().min(8).max(128).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const profile = await UserModel.findById(session.user.id)
      .select("name email image role phone city state bio isPhoneVerified userIntent createdAt")
      .lean();

    if (!profile) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to fetch profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const json = await request.json();
    const parsed = profileUpdateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid profile data.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existingProfile = await UserModel.findById(session.user.id)
      .select("phone isPhoneVerified email")
      .lean();

    if (!existingProfile) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const nextPhone =
      parsed.data.phone === undefined ? existingProfile.phone ?? null : parsed.data.phone ?? null;

    const phoneChanged =
      parsed.data.phone !== undefined && nextPhone !== (existingProfile.phone ?? null);

    const updatePayload: Record<string, unknown> = {
      name: parsed.data.name,
      image: parsed.data.image ?? null,
    };

    if (parsed.data.email && parsed.data.email !== existingProfile.email) {
      const emailInUse = await UserModel.findOne({ email: parsed.data.email })
        .select("_id")
        .lean();

      if (emailInUse) {
        return NextResponse.json({ message: "Email already in use." }, { status: 409 });
      }

      updatePayload.email = parsed.data.email;
    }

    if (parsed.data.phone !== undefined) {
      updatePayload.phone = nextPhone;
    }

    if (parsed.data.city !== undefined) {
      updatePayload.city = parsed.data.city ?? null;
    }

    if (parsed.data.state !== undefined) {
      updatePayload.state = parsed.data.state ?? null;
    }

    if (parsed.data.bio !== undefined) {
      updatePayload.bio = parsed.data.bio ?? null;
    }

    if (parsed.data.newPassword) {
      updatePayload.password = await hashPassword(parsed.data.newPassword);
    }

    if (phoneChanged) {
      updatePayload.isPhoneVerified = false;
      updatePayload.otp = null;
      updatePayload.otpExpiry = null;
    }

    const profile = await UserModel.findByIdAndUpdate(
      session.user.id,
      {
        $set: updatePayload,
      },
      {
        new: true,
      },
    )
      .select("name email image role phone city state bio isPhoneVerified userIntent")
      .lean();

    if (!profile) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (phoneChanged) {
      await ListingModel.updateMany(
        { sellerId: session.user.id },
        {
          $set: {
            isPhoneVerified: false,
          },
        },
      );
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to update profile." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    await Promise.all([
      FavoriteModel.deleteMany({ userId: session.user.id }),
      MessageModel.deleteMany({
        $or: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      }),
      ReviewModel.deleteMany({
        $or: [{ reviewerId: session.user.id }, { sellerId: session.user.id }],
      }),
      ListingModel.updateMany(
        { sellerId: session.user.id },
        {
          $set: {
            isActive: false,
            status: "archived",
          },
        },
      ),
      UserModel.deleteOne({ _id: session.user.id }),
    ]);

    return NextResponse.json({ message: "Account deleted." }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to delete account." }, { status: 500 });
  }
}
