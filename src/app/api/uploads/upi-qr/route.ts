import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "File is required." }, { status: 400 });
    }

    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ message: "Invalid file type. Only JPG, PNG, and WEBP are allowed." }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          message: `File size exceeds 5MB limit.`,
        },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);

    const upload = await uploadToCloudinary({
      fileBuffer,
      filename: `upi-qr-${session.user.id}-${Date.now()}`,
      resourceType: "image",
      folder: "pawhub/upi-qr",
    });

    return NextResponse.json(
      {
        secureUrl: upload.secure_url,
        publicId: upload.public_id,
        resourceType: upload.resource_type,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("UPI QR Upload Error:", error);
    return NextResponse.json(
      {
        message: "Unable to upload file.",
      },
      { status: 500 },
    );
  }
}
