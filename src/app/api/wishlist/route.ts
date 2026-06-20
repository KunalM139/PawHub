import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { WishlistModel } from "@/server/models/wishlist";
import { ProductModel } from "@/server/models/product";
import { NotificationModel } from "@/server/models/notification";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    let wishlist = await WishlistModel.findOne({ userId: currentUser.id }).populate("productIds");
    
    if (!wishlist) {
      wishlist = await WishlistModel.create({ userId: currentUser.id, productIds: [] });
    }

    return NextResponse.json({ wishlist });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ message: "Product ID required" }, { status: 400 });

    await connectToDatabase();
    
    let wishlist = await WishlistModel.findOne({ userId: currentUser.id });
    if (!wishlist) {
      wishlist = await WishlistModel.create({ userId: currentUser.id, productIds: [productId] });
    } else {
      if (!wishlist.productIds.includes(productId)) {
        wishlist.productIds.push(productId);
        await wishlist.save();

        // Notify seller
        const product = await ProductModel.findById(productId).select("title sellerId").lean();
        if (product && product.sellerId) {
          await NotificationModel.create({
            userId: product.sellerId,
            title: "Product Wishlisted",
            message: `Someone added your product "${product.title}" to their wishlist.`,
            type: "wishlist",
            link: `/dashboard/shop/${product._id}`
          });
        }
      }
    }

    return NextResponse.json({ wishlist });
  } catch (error) {
    return NextResponse.json({ message: "Error adding to wishlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    if (!productId) return NextResponse.json({ message: "Product ID required" }, { status: 400 });

    await connectToDatabase();
    const wishlist = await WishlistModel.findOneAndUpdate(
      { userId: currentUser.id },
      { $pull: { productIds: productId } },
      { returnDocument: "after" }
    );

    return NextResponse.json({ wishlist });
  } catch (error) {
    return NextResponse.json({ message: "Error removing from wishlist" }, { status: 500 });
  }
}
