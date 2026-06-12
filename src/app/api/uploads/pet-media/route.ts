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
    const resourceType = formData.get("resourceType");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "File is required." }, { status: 400 });
    }

    if (resourceType !== "image" && resourceType !== "video") {
      return NextResponse.json({ message: "Invalid resource type." }, { status: 400 });
    }

    const maxSize = resourceType === "image" ? 10 * 1024 * 1024 : 35 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          message: `File size exceeds ${resourceType === "image" ? "10MB" : "35MB"} limit.`,
        },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);

    const upload = await uploadToCloudinary({
      fileBuffer,
      filename: file.name || `${resourceType}-${Date.now()}`,
      resourceType,
      folder: "pawhub/listings",
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
        message: "Unable to upload file.",
      },
      { status: 500 },
    );
  }
}
