import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { OrderModel } from "@/server/models/order";
import { NotificationModel } from "@/server/models/notification";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";
import { orderCancelRateLimit, checkRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await props.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { status, trackingLink, estimatedDeliveryDate, rejectionReason, paymentStatus } = body;

    await connectToDatabase();
    
    const order = await OrderModel.findById(orderId).populate("productId");
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    const isSeller = order.sellerId.toString() === currentUser.id;
    const isBuyer = order.buyerId.toString() === currentUser.id;
    const isAdmin = currentUser.role === "admin";

    if (!isSeller && !isAdmin && !isBuyer) {
      return NextResponse.json({ success: false, message: "You are not authorized to perform this action." }, { status: 403 });
    }

    // Buyer Cancellation Logic
    if (isBuyer && status === "cancelled") {
      const rateLimitError = await checkRateLimit(orderCancelRateLimit, currentUser.id, isAdmin);
      if (rateLimitError) return rateLimitError;

      if (order.status === "shipped" || order.status === "delivered" || order.status === "rejected") {
        return NextResponse.json({ message: "Cannot cancel an order at this stage." }, { status: 400 });
      }
      
      if (order.status === "approved") {
        if (!order.approvedAt) {
          return NextResponse.json({ message: "Order missing approval timestamp." }, { status: 500 });
        }
        const hoursSinceApproval = (Date.now() - new Date(order.approvedAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceApproval > 48) {
          return NextResponse.json({ message: "Cancellation window (48 hours) has expired." }, { status: 400 });
        }
        
        // Restore stock since it was deducted upon approval
        const ProductModel = mongoose.models.Product;
        await ProductModel.findByIdAndUpdate(order.productId._id, {
          $inc: { stockQuantity: order.quantity }
        });
      }
      
      order.status = "cancelled";
      await order.save();
      
      // Notify seller
      await NotificationModel.create({
        userId: order.sellerId,
        title: "Order Cancelled",
        message: `Order for ${order.productId.title} was cancelled by the buyer.`,
        type: "order",
        link: "/seller-dashboard/orders"
      });
      
      return NextResponse.json({ order }, { status: 200 });
    }

    // Seller/Admin Logic
    if (isSeller || isAdmin) {
      // Handle Payment Status change
      if (paymentStatus === "completed" && order.paymentStatus !== "completed") {
        order.paymentStatus = "completed";
        await NotificationModel.create({
          userId: order.buyerId,
          title: "Payment Received",
          message: `Your payment for ${order.productId.title} has been marked as completed by the seller.`,
          type: "order",
          link: "/dashboard/orders"
        });
      }

      if (status && status !== order.status) {
        if (status === "approved" && order.status === "pending_approval") {
          order.status = "approved";
          order.approvedAt = new Date();
          if (estimatedDeliveryDate) order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
          
          // Deduct stock upon approval
          const ProductModel = mongoose.models.Product;
          await ProductModel.findByIdAndUpdate(order.productId._id, {
            $inc: { stockQuantity: -order.quantity }
          });
          
          await NotificationModel.create({
            userId: order.buyerId,
            title: "Order Approved",
            message: `Your order for ${order.productId.title} has been approved by the seller!`,
            type: "order",
            link: "/dashboard/orders"
          });
        } 
        else if (status === "rejected" && order.status === "pending_approval") {
          order.status = "rejected";
          if (rejectionReason) order.rejectionReason = rejectionReason;
          
          // No stock to restore as it wasn't deducted yet
          await NotificationModel.create({
            userId: order.buyerId,
            title: "Order Rejected",
            message: `Your order for ${order.productId.title} was rejected by the seller. Reason: ${rejectionReason || "Not specified."}`,
            type: "order",
            link: "/dashboard/orders"
          });
        }
        else if (status === "shipped") {
          order.status = "shipped";
          await NotificationModel.create({
            userId: order.buyerId,
            title: "Order Shipped",
            message: `Your order for ${order.productId.title} has been shipped!`,
            type: "order",
            link: "/dashboard/orders"
          });
        } 
        else if (status === "delivered") {
          order.status = "delivered";
          await NotificationModel.create({
            userId: order.buyerId,
            title: "Order Delivered",
            message: `Your order for ${order.productId.title} has been delivered!`,
            type: "order",
            link: "/dashboard/orders"
          });
        }
        else if (status === "cancelled") { // Seller manually cancelling after approval
          order.status = "cancelled";
          if (order.status === "approved" || order.status === "shipped") {
            const ProductModel = mongoose.models.Product;
            await ProductModel.findByIdAndUpdate(order.productId._id, {
              $inc: { stockQuantity: order.quantity }
            });
          }
        }
      }

      if (trackingLink !== undefined) order.trackingLink = trackingLink;
      
      await order.save();
      return NextResponse.json({ order }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    logger.error("Order PATCH Error:", error);
    return NextResponse.json({ message: error.message || "Failed to update order." }, { status: 500 });
  }
}
