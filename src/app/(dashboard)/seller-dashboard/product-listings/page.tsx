import type { Metadata } from "next";
import { ProductManagement } from "@/components/shop/product-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";

export const metadata: Metadata = {
  title: "Product Listings | Seller Dashboard",
  robots: { index: false, follow: false },
};

export default async function ProductListingsPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    redirect("/login");
  }

  await connectToDatabase();
  const dbUser = await UserModel.findById(sessionUser.id).lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Pet Shop Products</h1>
        <p className="mt-2 text-base text-slate-600">
          Manage your pet food, accessories, toys, and grooming products for sale.
        </p>
      </div>

      <ProductManagement isPhoneVerified={Boolean(dbUser?.isPhoneVerified)} />
    </div>
  );
}

