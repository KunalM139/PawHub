import { connectToDatabase } from "@/server/db/connect";
import { OrderModel } from "@/server/models/order";
import { ProductModel } from "@/server/models/product";
import { MessageModel } from "@/server/models/message";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DollarSign, ShoppingBag, TrendingUp, Users, Eye } from "lucide-react";

export default async function SellerAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "seller") {
    redirect("/login");
  }

  await connectToDatabase();
  const userId = user.id;

  // 1. Fetch all orders for this seller
  const orders = await OrderModel.find({ sellerId: userId }).lean();
  
  // Calculate Revenue (only from delivered/shipped/processing orders, not cancelled)
  const validOrders = orders.filter(o => o.status !== "cancelled" && o.status !== "pending");
  const totalRevenue = validOrders.reduce((sum, o) => sum + ((o as any).totalPriceInr || 0), 0);
  
  // Total Orders count
  const totalOrdersCount = orders.length;

  // 2. Fetch total inquiries (leads)
  const totalLeads = await MessageModel.countDocuments({ receiverId: userId });

  // 3. Get top selling products
  // Group orders by productId
  const productSales: Record<string, { quantity: number; title?: string }> = {};
  
  orders.forEach((o: any) => {
    if (o.status !== "cancelled") {
      const pid = o.productId.toString();
      if (!productSales[pid]) {
        productSales[pid] = { quantity: 0 };
      }
      productSales[pid].quantity += o.quantity;
    }
  });

  // Fetch product titles for the top ones
  const productIds = Object.keys(productSales);
  if (productIds.length > 0) {
    const products = await ProductModel.find({ _id: { $in: productIds } }).select("title").lean();
    products.forEach(p => {
      if (productSales[p._id.toString()]) {
        productSales[p._id.toString()].title = p.title;
      }
    });
  }

  // Sort top products by sales
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5); // top 5
    
  // Get top viewed products
  const topViewedProducts = await ProductModel.find({ sellerId: userId })
    .sort({ views: -1 })
    .limit(5)
    .select("title views")
    .lean();

  // 4. Real chart data for the last 7 days (Revenue)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const chartData = last7Days.map(date => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayOrders = validOrders.filter(o => {
      const orderDate = new Date((o as any).createdAt);
      return orderDate >= date && orderDate < nextDate;
    });
    
    const amount = dayOrders.reduce((sum, o) => sum + ((o as any).totalPriceInr || 0), 0);
    return {
      day: days[date.getDay()],
      amount,
    };
  });
  
  const maxChartAmount = Math.max(...chartData.map(d => d.amount), 1);

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="max-w-[1280px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <h1 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-primary)]">Analytics Dashboard</h1>
          <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)]">Track your store's performance, sales, and lead conversions.</p>
        </header>

        {/* KPI Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <article className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-[32px] card-shadow hover-scale flex flex-col justify-between gap-6 border border-[var(--color-outline-variant)]/30">
            <div className="flex justify-between items-start">
              <h2 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Total Revenue</h2>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined filled" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
            </div>
            <div>
              <p className="text-[36px] md:text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-[var(--color-on-surface)] truncate">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </article>

          {/* Orders */}
          <article className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-[32px] card-shadow hover-scale flex flex-col justify-between gap-6 border border-[var(--color-outline-variant)]/30">
            <div className="flex justify-between items-start">
              <h2 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Total Orders</h2>
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-container)]/20 flex items-center justify-center text-[var(--color-primary)]">
                <span className="material-symbols-outlined filled" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
              </div>
            </div>
            <div>
              <p className="text-[36px] md:text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-[var(--color-on-surface)] truncate">{totalOrdersCount}</p>
            </div>
          </article>

          {/* Inquiries */}
          <article className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-[32px] card-shadow hover-scale flex flex-col justify-between gap-6 border border-[var(--color-outline-variant)]/30">
            <div className="flex justify-between items-start">
              <h2 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Pet Inquiries</h2>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <span className="material-symbols-outlined filled" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
              </div>
            </div>
            <div>
              <p className="text-[36px] md:text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-[var(--color-on-surface)] truncate">{totalLeads}</p>
            </div>
          </article>

          {/* Conversion Rate */}
          <article className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-[32px] card-shadow hover-scale flex flex-col justify-between gap-6 border border-[var(--color-outline-variant)]/30">
            <div className="flex justify-between items-start">
              <h2 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Conversion Rate</h2>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined filled" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              </div>
            </div>
            <div>
              <p className="text-[36px] md:text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-[var(--color-on-surface)] truncate">
                {totalLeads > 0 ? Math.round((totalOrdersCount / totalLeads) * 100) : 0}%
              </p>
            </div>
          </article>
        </section>

        {/* Main Analytics Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Overview Chart Area (Left 2/3) */}
          <div className="lg:col-span-2 bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-[32px] card-shadow flex flex-col h-[500px] border border-[var(--color-outline-variant)]/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)]">Revenue Overview</h3>
              <span className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container)] px-3 py-1 rounded-full">(Last 7 Days)</span>
            </div>
            
            {/* Chart Area */}
            <div className="flex-1 relative flex flex-col border-t border-l border-[var(--color-outline-variant)]/30 mt-4 mb-4">
              {/* Y Axis Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between z-0">
                <div className="w-full border-t border-dashed border-[var(--color-outline-variant)]/30 flex-1"></div>
                <div className="w-full border-t border-dashed border-[var(--color-outline-variant)]/30 flex-1"></div>
                <div className="w-full border-t border-dashed border-[var(--color-outline-variant)]/30 flex-1"></div>
                <div className="w-full border-t border-dashed border-[var(--color-outline-variant)]/30 flex-1"></div>
              </div>
              
              {totalRevenue === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="bg-[var(--color-surface-bright)]/80 backdrop-blur-sm p-6 rounded-lg text-center border border-[var(--color-outline-variant)]/20 shadow-sm">
                    <span className="material-symbols-outlined text-4xl text-[var(--color-outline)] mb-2">monitoring</span>
                    <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)]">Make your first sale to see chart data!</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 z-10 flex items-end justify-between px-4 sm:px-8 pb-0 pt-4">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end">
                      <div className="w-full relative flex justify-center h-full items-end">
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-inverse-surface)] text-[var(--color-inverse-on-surface)] text-[12px] font-bold py-1 px-2 rounded pointer-events-none z-20 whitespace-nowrap">
                          ₹{d.amount.toLocaleString()}
                        </div>
                        <div 
                          className="w-full max-w-[40px] bg-[var(--color-primary-container)]/30 group-hover:bg-[var(--color-primary)] rounded-t-md transition-all duration-300"
                          style={{ height: `${(d.amount / maxChartAmount) * 100}%`, minHeight: d.amount > 0 ? "4px" : "0" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* X Axis Labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between px-4 sm:px-8 translate-y-full pt-3 text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-outline)]">
                {chartData.map((d, i) => (
                  <span key={i} className="flex-1 text-center">{d.day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Side Cards (Right 1/3) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Top Selling Products */}
            <div className="flex-1 bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-[32px] card-shadow flex flex-col border border-[var(--color-outline-variant)]/30 overflow-hidden">
              <h3 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-6">Top Selling Products</h3>
              {topProducts.length > 0 ? (
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                  {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30">
                      <div className="flex items-center gap-3 truncate pr-4">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-container)]/20 text-[var(--color-primary)] font-bold flex items-center justify-center shrink-0 text-sm">
                          #{i + 1}
                        </div>
                        <p className="text-[14px] leading-[1.2] font-bold text-[var(--color-on-surface)] truncate">{p.title || "Unknown Product"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-black text-[var(--color-on-surface)]">{p.quantity}</p>
                        <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--color-outline)] gap-4">
                  <span className="material-symbols-outlined text-5xl opacity-50">shopping_bag</span>
                  <p className="text-[16px] leading-[1.6]">No product sales yet</p>
                </div>
              )}
            </div>

            {/* Most Viewed Products */}
            <div className="flex-1 bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-[32px] card-shadow flex flex-col border border-[var(--color-outline-variant)]/30 overflow-hidden">
              <h3 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-6">Most Viewed Products</h3>
              {topViewedProducts.length > 0 ? (
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                  {topViewedProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30">
                      <div className="flex items-center gap-3 truncate pr-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-sm">
                          #{i + 1}
                        </div>
                        <p className="text-[14px] leading-[1.2] font-bold text-[var(--color-on-surface)] truncate">{p.title || "Unknown Product"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-black text-[var(--color-on-surface)]">{p.views}</p>
                        <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Views</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--color-outline)] gap-4">
                  <span className="material-symbols-outlined text-5xl opacity-50">visibility</span>
                  <p className="text-[16px] leading-[1.6]">No views yet</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}