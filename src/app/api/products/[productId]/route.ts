import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { ProductModel } from "@/server/models/product";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await connectToDatabase();
    const { productId } = await params;

    const product = await ProductModel.findById(productId)
      .populate("sellerId", "name email city image isPhoneVerified role phone")
      .lean();

    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("Product GET Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { productId } = await params;
    const body = await request.json();

    const product = await ProductModel.findById(productId);

    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    if (product.sellerId.toString() !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: body },
      { returnDocument: "after", runValidators: true }
    ).lean();

    return NextResponse.json({ product: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error("Product PATCH Error:", error);
    return NextResponse.json({ message: error.message || "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { productId } = await params;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    if (product.sellerId.toString() !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    await ProductModel.findByIdAndDelete(productId);

    return NextResponse.json({ message: "Product deleted." }, { status: 200 });
  } catch (error) {
    console.error("Product DELETE Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
