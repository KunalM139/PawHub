import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { ListingModel } from "@/server/models/listing";
import { ReportModel } from "@/server/models/report";

const updateReportSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["open", "in_review", "resolved", "dismissed"]),
  resolutionNote: z.string().trim().max(500).optional().nullable(),
  removeListing: z.boolean().optional(),
});

export async function GET() {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const reports = await ReportModel.find()
      .sort({ createdAt: -1 })
      .limit(120)
      .populate("reporterId", "name email")
      .populate("listingId", "title status")
      .lean();

    return NextResponse.json({ reports }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to fetch reports." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const json = await request.json();
    const parsed = updateReportSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const report = await ReportModel.findById(parsed.data.reportId);
    if (!report) {
      return NextResponse.json({ message: "Report not found." }, { status: 404 });
    }

    report.set({
      status: parsed.data.status,
      reviewedBy: adminGuard.adminId,
      reviewedAt: new Date(),
      resolutionNote: parsed.data.resolutionNote ?? null,
    });

    await report.save();

    if (parsed.data.removeListing) {
      await ListingModel.findByIdAndUpdate(report.listingId, {
        $set: {
          status: "archived",
          isActive: false,
        },
      });
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to update report." }, { status: 500 });
  }
}
