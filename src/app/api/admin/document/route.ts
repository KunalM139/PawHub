import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrivateDownloadUrl } from "@/lib/cloudinary";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");
    const resourceType = searchParams.get("resourceType") as "image" | "raw" | null;

    if (!publicId) {
      return NextResponse.json({ message: "publicId query parameter is required." }, { status: 400 });
    }

    const downloadUrl = getPrivateDownloadUrl(publicId, resourceType || "image");

    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    return NextResponse.json({ message: "Error generating secure URL." }, { status: 500 });
  }
}
