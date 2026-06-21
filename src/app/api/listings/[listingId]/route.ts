import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";

import { authOptions } from "@/lib/auth";
import { listingInputSchema } from "@/lib/validators/listing";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { listingEditRateLimit, listingDeleteRateLimit, checkRateLimit } from "@/lib/ratelimit";

type Params = {
  params: Promise<{ listingId: string }>;
};

function hasOwnership(
  sellerId: unknown,
  sessionUserId: string,
  sessionRole: string | undefined,
): boolean {
  if (sessionRole === "admin") {
    return true;
  }

  return String(sellerId) === sessionUserId;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { listingId } = await params;

    if (!Types.ObjectId.isValid(listingId)) {
      return NextResponse.json({ message: "Invalid listing id." }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await ListingModel.findById(listingId).lean();
    if (!listing) {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }

    if (!hasOwnership(listing.sellerId, session.user.id, session.user.role)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json({ listing }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to fetch listing.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ listingId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const rateLimitError = await checkRateLimit(listingEditRateLimit, session.user.id, session.user.role === "admin");
    if (rateLimitError) return rateLimitError;

    const { listingId } = await props.params;

    if (!Types.ObjectId.isValid(listingId)) {
      return NextResponse.json({ message: "Invalid listing id." }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await ListingModel.findById(listingId);
    if (!listing) {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }

    if (!hasOwnership(listing.sellerId, session.user.id, session.user.role)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const updates = (await request.json()) as Record<string, unknown>;

    const mergedForValidation = {
      listingType: updates.listingType ?? listing.listingType,
      petCategory: updates.petCategory ?? listing.petCategory,
      title: updates.title ?? listing.title,
      breed: updates.breed ?? listing.breed,
      description: updates.description ?? listing.description,
      ageInMonths: updates.ageInMonths ?? listing.ageInMonths,
      gender: updates.gender ?? listing.gender,
      priceInr: updates.priceInr ?? listing.priceInr,
      city: updates.city ?? listing.city,
      state: updates.state ?? listing.state,
      images: updates.images ?? listing.images,
      video: updates.video ?? listing.video,
    };

    const parsed = listingInputSchema.safeParse(mergedForValidation);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid listing input.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    listing.set({
      ...parsed.data,
      video: parsed.data.video ?? null,
      status: "pending",
    });

    await listing.save();

    return NextResponse.json({ listing }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to update listing.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ listingId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const rateLimitError = await checkRateLimit(listingDeleteRateLimit, session.user.id, session.user.role === "admin");
    if (rateLimitError) return rateLimitError;

    const { listingId } = await props.params;

    if (!Types.ObjectId.isValid(listingId)) {
      return NextResponse.json({ message: "Invalid listing id." }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await ListingModel.findById(listingId);
    if (!listing) {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }

    if (!hasOwnership(listing.sellerId, session.user.id, session.user.role)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    listing.set({
      isActive: false,
      status: "archived",
    });

    await listing.save();

    return NextResponse.json({ message: "Listing archived successfully." }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to delete listing.",
      },
      { status: 500 },
    );
  }
}
