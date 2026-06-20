const fs = require('fs');
const path = require('path');

const pagePath = path.resolve('src/app/(dashboard)/dashboard/shop/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

const newPageReturnBlock = `  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="max-w-[1280px] w-full mx-auto py-8 md:py-12">
        {/* Header Area */}
        <div className="mb-8">
          <h1 className="text-[32px] md:text-[40px] leading-[1.2] font-bold text-[var(--color-on-surface)] mb-2 tracking-tight">PawHub Pet Shop</h1>
          <p className="text-[16px] md:text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)] font-medium">
            Browse premium pet food, accessories, toys, and supplies from verified sellers.
          </p>
        </div>

        <ShopGallery />
      </main>
    </div>
  );`;

pageContent = pageContent.replace(/  return \([\s\S]*\}\n?$/, newPageReturnBlock + '\n}\n');
fs.writeFileSync(pagePath, pageContent, 'utf8');

const componentPath = path.resolve('src/components/shop/shop-gallery.tsx');
let componentContent = fs.readFileSync(componentPath, 'utf8');

const newComponentReturnBlock = `  return (
    <div className="space-y-8 font-outfit text-[var(--color-on-surface)]">
      {selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Filter Bar */}
      <div className="bg-[var(--color-surface-container-lowest)] rounded-2xl border border-[var(--color-outline-variant)]/30 card-shadow p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-grow">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)]">search</span>
            <input
              type="text"
              placeholder="Search products, brands, or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--color-surface-container-low)] border-none rounded-full py-3.5 pl-12 pr-4 text-[var(--color-on-surface)] font-medium text-[16px] focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-outline)] transition-all shadow-inner"
            />
          </div>
          
          {/* Sort */}
          <div className="relative w-full md:w-auto shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full md:w-auto appearance-none bg-[var(--color-surface-container-low)] border-none rounded-full py-3.5 pl-5 pr-10 text-[var(--color-on-surface)] font-bold text-[14px] tracking-wide focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer shadow-inner"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)] pointer-events-none">expand_more</span>
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar shrink-0">
          {["all", "food", "accessories", "toys", "grooming", "other"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={\`rounded-full px-6 py-2.5 font-bold text-[14px] tracking-wide whitespace-nowrap transition-all \${
                category === cat
                  ? "btn-gradient text-[var(--color-on-primary)] shadow-md"
                  : "bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface)]"
              }\`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <span className="material-symbols-outlined animate-spin text-[40px] text-[var(--color-primary)]">progress_activity</span>
          <p className="mt-4 font-bold text-[16px] text-[var(--color-on-surface-variant)]">Loading premium products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[24px] border-2 border-dashed border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-16 text-center card-shadow">
          <span className="material-symbols-outlined text-[64px] text-[var(--color-outline)] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
          <h3 className="text-[24px] font-bold text-[var(--color-on-surface)]">No products found</h3>
          <p className="text-[16px] text-[var(--color-on-surface-variant)] font-medium mt-2">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product._id} className="bg-[var(--color-surface-container-lowest)] rounded-[24px] card-shadow hover-scale border border-[var(--color-outline-variant)]/30 overflow-hidden flex flex-col relative group">
              {/* Image Container */}
              <div className="relative h-48 w-full bg-[var(--color-surface-container-low)] overflow-hidden">
                <Link href={\`/dashboard/shop/\${product._id}\`} className="block w-full h-full">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex w-full h-full items-center justify-center">
                      <span className="material-symbols-outlined text-[48px] text-[var(--color-outline)]">image</span>
                    </div>
                  )}
                  {product.stockQuantity === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-inverse-surface)]/60 backdrop-blur-[2px]">
                      <span className="rounded-full bg-[var(--color-error)] px-4 py-1.5 text-[12px] font-bold uppercase tracking-widest text-[var(--color-on-error)] shadow-md">Out of Stock</span>
                    </div>
                  ) : (product.averageRating || 0) >= 4.5 && (product.totalReviews || 0) >= 2 ? (
                    <div className="absolute top-4 left-4 bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-md z-10">
                      Best Seller
                    </div>
                  ) : null}
                </Link>
                
                {/* Favorite Button */}
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isWishlisted = wishlist.includes(product._id);
                    const method = isWishlisted ? "DELETE" : "POST";
                    const url = isWishlisted ? \`/api/wishlist?productId=\${product._id}\` : "/api/wishlist";
                    const body = isWishlisted ? null : JSON.stringify({ productId: product._id });
                    
                    setWishlist(prev => isWishlisted ? prev.filter(id => id !== product._id) : [...prev, product._id]);
                    
                    const res = await fetch(url, {
                      method,
                      headers: body ? { "Content-Type": "application/json" } : undefined,
                      body: body || undefined
                    });
                    
                    if (res.ok) {
                      window.dispatchEvent(new Event("wishlist-updated"));
                    } else {
                      setWishlist(prev => isWishlisted ? [...prev, product._id] : prev.filter(id => id !== product._id));
                    }
                  }}
                  className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[var(--color-outline)] hover:text-[var(--color-secondary)] hover:scale-110 transition-all shadow-sm z-10"
                >
                  <span className="material-symbols-outlined text-[20px]" style={wishlist.includes(product._id) ? { fontVariationSettings: "'FILL' 1", color: 'var(--color-secondary)' } : {}}>favorite</span>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md">
                    {product.category}
                  </span>
                  <span className={\`font-bold text-[12px] \${product.stockQuantity < 5 ? "text-orange-500" : "text-[var(--color-outline)]"}\`}>
                    {product.stockQuantity} in stock
                  </span>
                </div>
                
                <Link href={\`/dashboard/shop/\${product._id}\`} className="hover:text-[var(--color-primary)] transition-colors">
                  <h3 className="font-bold text-[18px] text-[var(--color-on-surface)] mb-2 line-clamp-2 leading-[1.3]">{product.title}</h3>
                </Link>
                <p className="font-medium text-[14px] text-[var(--color-on-surface-variant)] line-clamp-2 mb-5 flex-grow">{product.description}</p>
                
                <div className="mt-auto">
                  <div className="font-bold text-[24px] text-[var(--color-on-surface)] mb-4">₹{product.priceInr.toLocaleString()}</div>
                  <div className="flex gap-2 w-full">
                    {cartItemIds.includes(product._id) ? (
                      <Link
                        href="/dashboard/cart"
                        className="flex-1 bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] font-bold text-[14px] tracking-wide py-3 rounded-full transition-colors flex items-center justify-center shadow-sm"
                      >
                        Go to Cart
                      </Link>
                    ) : (
                      <button
                        onClick={async () => {
                          const btn = document.getElementById(\`add-btn-\${product._id}\`);
                          if(btn) btn.innerHTML = "Adding...";
                          const res = await fetch("/api/cart", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ productId: product._id, quantity: 1 })
                          });
                          if(res.ok) {
                            if(btn) btn.innerHTML = "Added!";
                            window.dispatchEvent(new Event("cart-updated"));
                          } else {
                            const data = await res.json();
                            toast.error(data.message || "Failed to add");
                            if(btn) btn.innerHTML = "Add to Cart";
                          }
                        }}
                        id={\`add-btn-\${product._id}\`}
                        disabled={product.stockQuantity === 0}
                        className="flex-1 bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface)] font-bold text-[14px] tracking-wide py-3 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
                      >
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedProduct(product)}
                      disabled={product.stockQuantity === 0}
                      className="flex-1 btn-gradient text-[var(--color-on-primary)] font-bold text-[14px] tracking-wide py-3 rounded-full transition-all flex items-center justify-center shadow-md disabled:opacity-50 hover-scale"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`;

const componentReturnBlockRegex = /  return \([\s\S]*\}\n?$/;
componentContent = componentContent.replace(componentReturnBlockRegex, newComponentReturnBlock + '\n}\n');

fs.writeFileSync(componentPath, componentContent, 'utf8');
console.log('Successfully updated buyer pet shop gallery and page');
