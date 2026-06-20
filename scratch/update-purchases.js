const fs = require('fs');
const path = require('path');

const componentPath = path.resolve('src/components/shop/order-list.tsx');
let componentContent = fs.readFileSync(componentPath, 'utf8');

const newFilterBar = `{/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors shadow-sm border border-[var(--color-outline-variant)]/30">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </button>
          <div className="relative">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="appearance-none bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 text-[14px] font-bold tracking-wide text-[var(--color-on-surface)] py-2.5 pl-5 pr-10 rounded-full focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer hover:bg-[var(--color-surface-bright)] transition-colors shadow-sm"
            >
              <option value="all">All Orders</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-on-surface-variant)] text-[20px]">expand_more</span>
          </div>
          <div className="relative">
            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)} 
              className="appearance-none bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 text-[14px] font-bold tracking-wide text-[var(--color-on-surface)] py-2.5 pl-5 pr-10 rounded-full focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer hover:bg-[var(--color-surface-bright)] transition-colors shadow-sm"
            >
              <option value="all">Any Year</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-on-surface-variant)] text-[20px]">expand_more</span>
          </div>
        </div>
        <div className="relative w-full sm:w-auto">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="appearance-none w-full sm:w-auto bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 text-[14px] font-bold tracking-wide text-[var(--color-on-surface)] py-2.5 pl-5 pr-10 rounded-full focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer hover:bg-[var(--color-surface-bright)] transition-colors shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-on-surface-variant)] text-[20px]">expand_more</span>
        </div>
      </div>`;

const newCardsGrid = `        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedOrders.map((order) => {
            return (
              <div 
                key={order._id} 
                onClick={() => {
                  setSelectedOrder(order);
                  setTrackingLink(order.trackingLink || "");
                  setRejectionReason(order.rejectionReason || "");
                  setEstimatedDeliveryDate(order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : "");
                }}
                className="group cursor-pointer bg-[var(--color-surface-container-lowest)] rounded-3xl card-shadow hover-scale overflow-hidden flex flex-col border border-[var(--color-outline-variant)]/20"
              >
                <div className="h-48 w-full bg-[var(--color-surface-container)] overflow-hidden relative">
                  <img src={order.productId.images[0] || "https://placehold.co/400x300"} alt={order.productId.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-[18px] font-bold text-[var(--color-on-surface)] line-clamp-2 mb-4 leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                    {order.productId.title}
                  </h3>
                  <div className="mt-auto flex justify-between items-center pt-2">
                    {(() => {
                      const config = getStatusConfig(order.status);
                      let badgeClass = "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]";
                      
                      if (order.status === "delivered") badgeClass = "bg-[var(--color-primary-fixed)] text-[var(--color-primary)]";
                      else if (order.status === "cancelled" || order.status === "rejected") badgeClass = "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]";
                      else if (order.status === "shipped") badgeClass = "bg-[var(--color-tertiary-fixed)] text-[var(--color-tertiary)]";
                      else if (order.status === "approved") badgeClass = "bg-[var(--color-secondary-fixed)] text-[var(--color-secondary)]";

                      return (
                        <span className={\`uppercase px-3 py-1 rounded-full text-[10px] font-bold tracking-wider \${badgeClass}\`}>
                          {config.label}
                        </span>
                      );
                    })()}
                    <span className="text-[var(--color-primary)] font-bold text-[18px]">
                      ₹{order.totalPriceInr.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>`;

// Replace the filter bar
componentContent = componentContent.replace(
  /\{\/\* Filter Bar \*\/\}[\s\S]*?<\/section>/,
  newFilterBar
);

// Replace the grid
componentContent = componentContent.replace(
  /<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">[\s\S]*?(?=\{\/\* Modal)/,
  newCardsGrid + '\n      )}\n\n      '
);

fs.writeFileSync(componentPath, componentContent, 'utf8');
console.log('Successfully updated order list component layout');
