const fs = require('fs');
const path = require('path');

const componentPath = path.resolve('src/components/shop/order-list.tsx');
let componentContent = fs.readFileSync(componentPath, 'utf8');

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

// Find the start of the grid
const startIdx = componentContent.indexOf('<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">');
if (startIdx !== -1) {
  // Find the end of the grid block. We know it ends before `{selectedOrder && (`
  const endIdx = componentContent.indexOf('{selectedOrder && (', startIdx);
  if (endIdx !== -1) {
    // The end index should be right before `      {selectedOrder && (`
    // Let's back up to the line before it which is `      )}`
    const sliceToReplace = componentContent.substring(startIdx, endIdx);
    
    // We only want to replace up to the closing `      )}` of the map.
    // Actually `sliceToReplace` is the whole grid + `      )}\n\n      `
    // We can just replace the whole slice with our new grid + `\n      )}\n\n      `
    // Wait, the grid itself is wrapped in `filteredAndSortedOrders.length === 0 ? (...) : (`
    // The `</div>` of the grid is the end of the ternary branch.
    // So `</div>\n      )}`
    
    // Let's just use regex bounded by `{selectedOrder && (`
    componentContent = componentContent.substring(0, startIdx) + newCardsGrid + '\n      )}\n\n      ' + componentContent.substring(endIdx);
    fs.writeFileSync(componentPath, componentContent, 'utf8');
    console.log('Successfully updated grid.');
  } else {
    console.log('Could not find end index');
  }
} else {
  console.log('Could not find start index');
}
