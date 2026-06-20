const fs = require('fs');
const path = require('path');

const pagePath = path.resolve('src/app/(dashboard)/seller-dashboard/product-listings/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

const newPageReturnBlock = `  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="max-w-[1280px] w-full mx-auto py-8 md:py-12">
        <header className="mb-12">
          <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-[var(--color-on-surface)] mb-4 tracking-tight">Pet Shop Products</h1>
          <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-2xl font-medium">
            Manage your pet food, accessories, toys, and grooming products for sale.
          </p>
        </header>

        <ProductManagement isPhoneVerified={Boolean(dbUser?.isPhoneVerified)} />
      </main>
    </div>
  );`;

pageContent = pageContent.replace(/  return \([\s\S]*\}\n?$/, newPageReturnBlock + '\n}\n');
fs.writeFileSync(pagePath, pageContent, 'utf8');

const componentPath = path.resolve('src/components/shop/product-management.tsx');
let componentContent = fs.readFileSync(componentPath, 'utf8');

const newComponentReturnBlock = `  return (
    <div className="space-y-8 font-outfit text-[var(--color-on-surface)]">
      {!isPhoneVerified ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[14px] font-medium text-red-800 flex items-center shadow-sm">
          <span className="material-symbols-outlined text-[20px] mr-2">error</span>
          Phone verification is required to add products.
          <Link href="/seller-dashboard/verification" className="ml-2 font-bold underline hover:text-red-900">
            Verify now
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Left Column: Form Section */}
        <section className="bg-[var(--color-surface-container-lowest)] rounded-3xl p-6 sm:p-8 card-shadow border border-[var(--color-outline-variant)]/30 hover:shadow-lg transition-shadow duration-300">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-[24px] leading-[1.3] font-bold text-[var(--color-on-surface)]">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <span className="material-symbols-outlined text-[var(--color-primary)] bg-[var(--color-primary-container)]/30 p-2.5 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>
              {editingId ? "edit" : "add_circle"}
            </span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-bold text-[var(--color-on-surface-variant)] mb-2 uppercase">Category</label>
                <div className="relative">
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 text-[var(--color-on-surface)] font-medium text-[16px] rounded-xl py-3.5 px-4 appearance-none outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all cursor-pointer shadow-sm hover:border-[var(--color-outline-variant)]"
                  >
                    <option disabled value="">Select a category</option>
                    <option value="food">Pet Food</option>
                    <option value="accessories">Accessories</option>
                    <option value="toys">Toys</option>
                    <option value="grooming">Grooming</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)] pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-bold text-[var(--color-on-surface-variant)] mb-2 uppercase">Product Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 text-[var(--color-on-surface)] font-medium text-[16px] rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-outline)] shadow-sm hover:border-[var(--color-outline-variant)]"
                  placeholder="e.g. Premium Kibble"
                />
              </div>

              <div>
                <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-bold text-[var(--color-on-surface-variant)] mb-2 uppercase">Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[16px] text-[var(--color-outline)]">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.priceInr}
                    onChange={(e) => setForm({ ...form, priceInr: e.target.value })}
                    className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 text-[var(--color-on-surface)] font-medium text-[16px] rounded-xl py-3.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-outline)] shadow-sm hover:border-[var(--color-outline-variant)]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-bold text-[var(--color-on-surface-variant)] mb-2 uppercase">Stock Quantity</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                  className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 text-[var(--color-on-surface)] font-medium text-[16px] rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-outline)] shadow-sm hover:border-[var(--color-outline-variant)]"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-bold text-[var(--color-on-surface-variant)] mb-2 uppercase">Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 text-[var(--color-on-surface)] font-medium text-[16px] rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-outline)] resize-y shadow-sm hover:border-[var(--color-outline-variant)]"
                placeholder="Detail the features, ingredients, or benefits..."
              />
            </div>

            <div>
              <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-bold text-[var(--color-on-surface-variant)] mb-2 uppercase">Product Images (up to 5)</label>
              <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-[var(--color-outline-variant)] border-dashed rounded-2xl bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer group relative">
                <div className="space-y-2 text-center">
                  <span className="material-symbols-outlined text-[36px] text-[var(--color-outline)] group-hover:text-[var(--color-primary)] transition-colors">add_photo_alternate</span>
                  <div className="text-[16px] text-[var(--color-on-surface-variant)] font-medium">
                    <span className="text-[var(--color-primary)] font-bold group-hover:underline">Upload files</span> or drag and drop
                  </div>
                  <p className="text-[12px] font-bold tracking-wider uppercase text-[var(--color-outline)]">PNG, JPG, WEBP up to 5MB</p>
                </div>
                <input
                  accept="image/*"
                  multiple
                  type="file"
                  onChange={handleImageSelection}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {(imageUrls.length > 0 || selectedImages.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {imageUrls.map((url) => (
                    <div key={url} className="relative group">
                      <img src={url} alt="Uploaded" className="h-20 w-20 object-cover rounded-xl border border-[var(--color-outline-variant)]/50 shadow-sm" />
                      <button
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter(u => u !== url))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 hover:scale-110"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                  {selectedImages.map((file, idx) => (
                    <div key={idx} className="relative group flex h-20 w-20 items-center justify-center rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] shadow-sm">
                       <span className="material-symbols-outlined text-[var(--color-outline)]">image</span>
                       <button
                        type="button"
                        onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 hover:scale-110"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-[14px] font-medium text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            {message && <p className="text-[14px] font-medium text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">{message}</p>}

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !isPhoneVerified}
                className="flex-1 btn-gradient text-[var(--color-on-primary)] font-bold text-[16px] py-4 px-8 rounded-full shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 hover-scale"
              >
                <span>{isSubmitting ? "Saving..." : editingId ? "Update Product" : "Add Product"}</span>
                {!isSubmitting && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetFormState}
                  className="px-8 py-4 bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] rounded-full font-bold transition-colors shadow-sm"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Right Column: My Products List */}
        <section className="bg-[var(--color-surface-container-lowest)] rounded-3xl p-6 sm:p-8 card-shadow border border-[var(--color-outline-variant)]/30 flex flex-col h-[800px] overflow-hidden relative">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <h2 className="text-[24px] leading-[1.3] font-bold text-[var(--color-on-surface)]">My Products</h2>
            <button 
              onClick={fetchMyProducts} 
              className="text-[14px] font-bold tracking-wide text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors flex items-center gap-1.5 bg-[var(--color-primary-container)]/10 px-4 py-2.5 rounded-full hover:bg-[var(--color-primary-container)]/20"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Refresh
            </button>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <span className="material-symbols-outlined animate-spin text-[32px] text-[var(--color-primary)]">progress_activity</span>
              </div>
            ) : products.length === 0 ? (
              <div className="h-full min-h-[400px] rounded-2xl border-2 border-dashed border-[var(--color-outline-variant)]/50 bg-[var(--color-surface)]/50 flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-24 h-24 bg-[var(--color-primary-fixed)] rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <span className="material-symbols-outlined text-[var(--color-on-primary-fixed-variant)]" style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                </div>
                <h3 className="text-[24px] font-bold text-[var(--color-on-surface)] mb-3">No Products Yet</h3>
                <p className="text-[16px] text-[var(--color-on-surface-variant)] leading-relaxed max-w-sm mx-auto">
                  Your inventory is currently empty. Start by adding your first premium pet product using the form to grow your shop.
                </p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="flex gap-5 p-5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-2xl hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-container-low)] transition-all card-shadow group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[var(--color-surface-container)] overflow-hidden shrink-0 border border-[var(--color-outline-variant)]/20 shadow-sm relative">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-outline)]">
                        <span className="material-symbols-outlined text-[32px]">image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-[18px] text-[var(--color-on-surface)] truncate group-hover:text-[var(--color-primary)] transition-colors">{product.title}</h3>
                    <p className="text-[15px] text-[var(--color-on-surface-variant)] font-medium mt-1">₹{product.priceInr.toLocaleString()} • <span className={\`\${product.stockQuantity > 0 ? "text-emerald-600" : "text-red-500"}\`}>{product.stockQuantity} in stock</span></p>
                    <div className="flex gap-4 mt-4">
                      <button 
                        onClick={() => startEditing(product)} 
                        className="text-[13px] font-bold tracking-wider uppercase text-[var(--color-primary)] hover:text-[var(--color-secondary)] flex items-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)} 
                        className="text-[13px] font-bold tracking-wider uppercase text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={!!productToDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}`;

const componentReturnBlockRegex = /  return \([\s\S]*\}\n?$/;
componentContent = componentContent.replace(componentReturnBlockRegex, newComponentReturnBlock + '\n}\n');

fs.writeFileSync(componentPath, componentContent, 'utf8');
console.log('Successfully updated product listings page and component');
