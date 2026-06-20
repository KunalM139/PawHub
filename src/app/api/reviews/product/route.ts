import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { ProductReviewModel } from "@/server/models/product-review";
import { ProductModel } from "@/server/models/product";
import { OrderModel } from "@/server/models/order";
import { NotificationModel } from "@/server/models/notification";
import { getCurrentUser } from "@/lib/auth";

async function updateProductRating(productId: string) {
  const allReviews = await ProductReviewModel.find({ productId }).select("rating").lean();
  const totalReviews = allReviews.length;
  const avgRating = totalReviews > 0 ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews : 0;

  await ProductModel.findByIdAndUpdate(productId, {
    averageRating: Number(avgRating.toFixed(1)),
    totalReviews
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    if (!productId) return NextResponse.json({ message: "Product ID required" }, { status: 400 });

    await connectToDatabase();
    const reviews = await ProductReviewModel.find({ productId })
      .populate("reviewerId", "name image")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { productId, rating, comment, images } = await request.json();
    if (!productId || !rating || !comment) return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    await connectToDatabase();

    // Verify purchase
    const hasPurchased = await OrderModel.exists({
      productId,
      buyerId: currentUser.id,
      status: "delivered"
    });

    if (!hasPurchased) {
      return NextResponse.json({ message: "Only customers who have received this product can review it." }, { status: 403 });
    }

    const review = await ProductReviewModel.create({
      productId,
      reviewerId: currentUser.id,
      rating: Number(rating),
      comment,
      images: images || [],
      isVerifiedPurchase: true
    });

    await updateProductRating(productId);

    const product = await ProductModel.findById(productId).select("sellerId title").lean();
    if (product && product.sellerId) {
      await NotificationModel.create({
        userId: product.sellerId,
        title: "New Product Review",
        message: `Your product "${product.title}" received a ${rating}-star review.`,
        type: "review",
        link: `/dashboard/shop/${product._id}`
      });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "You have already reviewed this product" }, { status: 400 });
    }
    return NextResponse.json({ message: "Error submitting review" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { reviewId, rating, comment, images } = await request.json();
    if (!reviewId || !rating || !comment) return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    await connectToDatabase();

    const review = await ProductReviewModel.findOneAndUpdate(
      { _id: reviewId, reviewerId: currentUser.id },
      { $set: { rating: Number(rating), comment, images: images || [] } },
      { returnDocument: "after" }
    );

    if (!review) {
      return NextResponse.json({ message: "Review not found or unauthorized" }, { status: 404 });
    }

    await updateProductRating(review.productId.toString());

    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json({ message: "Error updating review" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const reviewId = url.searchParams.get("reviewId");
    if (!reviewId) return NextResponse.json({ message: "Review ID required" }, { status: 400 });

    await connectToDatabase();

    const review = await ProductReviewModel.findOneAndDelete({ _id: reviewId, reviewerId: currentUser.id });
    
    if (!review) {
      return NextResponse.json({ message: "Review not found or unauthorized" }, { status: 404 });
    }

    await updateProductRating(review.productId.toString());

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting review" }, { status: 500 });
  }
}
