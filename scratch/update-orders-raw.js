const fs = require('fs');
const path = require('path');

const componentPath = path.resolve('src/components/shop/order-list.tsx');
let componentContent = fs.readFileSync(componentPath, 'utf8');

const exactFilterBar = `{/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <div className="relative">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="appearance-none bg-surface-container-lowest border border-surface-variant text-label-md font-label-md text-on-surface py-2.5 pl-4 pr-10 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer hover:bg-surface-bright transition-colors"
            >
              <option value="all">All Orders</option>
              <option value="delivered">Delivered</option>
              <option value="shipped">In Transit</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending_approval">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
          <div className="relative">
            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)} 
              className="appearance-none bg-surface-container-lowest border border-surface-variant text-label-md font-label-md text-on-surface py-2.5 pl-4 pr-10 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer hover:bg-surface-bright transition-colors"
            >
              <option value="all">Any Year</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>
        <div className="relative w-full sm:w-auto">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="appearance-none w-full sm:w-auto bg-surface-container-lowest border border-surface-variant text-label-md font-label-md text-on-surface py-2.5 pl-4 pr-10 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer hover:bg-surface-bright transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
        </div>
      </div>`;

const exactGrid = `        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                className="bg-surface-container-lowest rounded-3xl card-shadow hover-scale overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="h-48 w-full bg-surface-container overflow-hidden relative">
                  <img src={order.productId.images[0] || "https://placehold.co/400x300"} alt={order.productId.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-[18px] font-bold text-on-surface line-clamp-2 mb-4 leading-tight group-hover:text-primary transition-colors">
                    {order.productId.title}
                  </h3>
                  <div className="mt-auto flex justify-between items-center">
                    {(() => {
                      let badgeClass = "bg-surface-container text-on-surface-variant";
                      let label = "PENDING";
                      
                      if (order.status === "delivered") {
                        badgeClass = "bg-primary-fixed text-primary";
                        label = "DELIVERED";
                      } else if (order.status === "cancelled" || order.status === "rejected") {
                        badgeClass = "bg-surface-container text-on-surface-variant";
                        label = order.status.toUpperCase();
                      } else if (order.status === "shipped") {
                        badgeClass = "bg-tertiary-fixed text-tertiary";
                        label = "IN TRANSIT";
                      } else if (order.status === "approved") {
                        badgeClass = "bg-secondary-fixed text-secondary";
                        label = "APPROVED";
                      }

                      return (
                        <span className={\`uppercase px-3 py-1 rounded-full text-[10px] font-bold tracking-wider \${badgeClass}\`}>
                          {label}
                        </span>
                      );
                    })()}
                    <span className="text-primary font-bold text-body-lg">
                      ₹{order.totalPriceInr.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>`;

// Replace filter bar safely using indexOf
const filterStart = componentContent.indexOf('{/* Filter Bar */}');
if (filterStart !== -1) {
  // Find the end of the filter bar (which is the next sibling `<!-- Content Area / Empty State -->` or similar)
  const filterEnd = componentContent.indexOf('{/* Content Area', filterStart);
  if (filterEnd !== -1) {
    componentContent = componentContent.substring(0, filterStart) + exactFilterBar + '\n\n      ' + componentContent.substring(filterEnd);
  }
}

// Replace grid safely using indexOf
const gridStartStr = '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">';
const gridStartIdx = componentContent.indexOf(gridStartStr);
if (gridStartIdx !== -1) {
  // Find the end by looking for `{selectedOrder && (`
  const modalStartIdx = componentContent.indexOf('{selectedOrder && (', gridStartIdx);
  if (modalStartIdx !== -1) {
    // The previous `      )}` belongs to the ternary map end. Let's trace back from modalStartIdx to find `)}`
    componentContent = componentContent.substring(0, gridStartIdx) + exactGrid + '\n      )}\n\n      ' + componentContent.substring(modalStartIdx);
    fs.writeFileSync(componentPath, componentContent, 'utf8');
    console.log('Successfully applied raw HTML class mapping to order-list.tsx');
  } else {
    console.log('Could not find modal start index');
  }
} else {
  console.log('Could not find grid start match using indexOf');
}
