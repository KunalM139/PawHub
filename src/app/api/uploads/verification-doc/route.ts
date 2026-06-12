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

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      return NextResponse.json(
        {
          message: "Only image and PDF files are allowed.",
        },
        { status: 400 },
      );
    }

    const maxSize = 12 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          message: "File size exceeds 12MB limit.",
        },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);

    const upload = await uploadToCloudinary({
      fileBuffer,
      filename: file.name || `verification-${Date.now()}`,
      resourceType: isImage ? "image" : "raw",
      folder: "pawhub/verification-docs",
    });

    return NextResponse.json(
      {
        secureUrl: upload.secure_url,
        publicId: upload.public_id,
        resourceType: upload.resource_type,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        message: "Unable to upload verification document.",
      },
      { status: 500 },
    );
  }
}
