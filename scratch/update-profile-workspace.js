const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/profile/profile-workspace.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newReturnBlock = `  return (
    <div className="flex flex-col gap-12">
      {/* Card 1: Profile Summary */}
      <section className="bg-[var(--color-surface-container-lowest)] rounded-[3rem] p-[32px] card-shadow hover-scale relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--color-primary-fixed)] opacity-30 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-4">
          <div>
            <h1 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-on-surface)] mb-2">My Profile</h1>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)]">Review your account details, verification status, and contact information.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing((current) => !current)}
            className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-[14px] leading-[1.2] tracking-[0.05em] font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            {isEditing ? (
              <>
                <span className="material-symbols-outlined text-[20px]">close</span>
                Close Editor
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">edit</span>
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
          {/* Left Column: User Details */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--color-surface-container-low)] flex-shrink-0 bg-[var(--color-surface-container-highest)] relative">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    unoptimized
                    loader={({ src }) => src}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xl font-bold text-[var(--color-on-surface-variant)]">
                    {initials || <span className="material-symbols-outlined text-[40px]">person</span>}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-1">{profile.name}</h2>
                <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] mb-3">{profile.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] text-[14px] leading-[1.2] tracking-[0.05em] font-semibold rounded-full uppercase tracking-wider">
                    {profile.role}
                  </span>
                  {profile.isPhoneVerified ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[14px] leading-[1.2] tracking-[0.05em] font-semibold rounded-full uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      Phone Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-[14px] leading-[1.2] tracking-[0.05em] font-semibold rounded-full uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      Phone Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface-container-low)] rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 border-b border-[var(--color-outline-variant)]/30 pb-4">
                <span className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] col-span-1">Phone</span>
                <span className="text-[16px] leading-[1.6] text-[var(--color-on-surface)] col-span-2">{profile.phone || "Not added"}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-[var(--color-outline-variant)]/30 pb-4">
                <span className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] col-span-1">Location</span>
                <span className="text-[16px] leading-[1.6] text-[var(--color-on-surface)] col-span-2">{profile.city || profile.state ? \`\${profile.city || ""}\${profile.city && profile.state ? ", " : ""}\${profile.state || ""}\` : "Not added"}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-[var(--color-outline-variant)]/30 pb-4">
                <span className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] col-span-1">Intent</span>
                <span className="text-[16px] leading-[1.6] text-[var(--color-on-surface)] col-span-2">
                  {profile.userIntent === "seller" ? "Seller posting pets" : profile.userIntent === "rehome" ? "Rehoming a pet" : "Adopting a pet"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] col-span-1">Bio</span>
                <span className="text-[16px] leading-[1.6] text-[var(--color-on-surface)] col-span-2">{profile.bio || "Share your pet journey to build trust."}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Trust & Verification */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)]">Trust & Verification</h3>
              <span className="material-symbols-outlined text-[var(--color-outline)] cursor-help" title="Verification information">info</span>
            </div>

            {profile.isPhoneVerified ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex items-start gap-4">
                <span className="material-symbols-outlined text-emerald-600 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <div>
                  <h4 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-emerald-900 mb-1">Phone Number Verified</h4>
                  <p className="text-[16px] leading-[1.6] text-emerald-800 text-sm">Your phone number is verified. Listings will carry the verified badge, increasing trust with potential connections.</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-red-600 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <div>
                    <h4 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-red-900 mb-1">Phone Number Unverified</h4>
                    <p className="text-[16px] leading-[1.6] text-red-800 text-sm">Verify your phone number to post listings and increase trust.</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => void handleSendOtp()}
                    disabled={isSendingOtp}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-red-600 px-4 text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    {isSendingOtp ? "Sending OTP..." : "Send OTP Code"}
                  </button>
                  <input
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value)}
                    placeholder="Enter Code"
                    className="h-10 w-32 rounded-full border border-red-200 bg-white px-4 text-sm focus:ring-1 focus:ring-red-500 outline-none text-[16px] leading-[1.6] text-[var(--color-on-surface)]"
                  />
                  <button
                    type="button"
                    onClick={() => void handleVerifyOtp()}
                    disabled={isVerifyingOtp}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 px-4 text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify"}
                  </button>
                </div>
                {otpNotice && <p className="text-[14px] font-semibold text-emerald-700 mt-1">{otpNotice}</p>}
                {otpError && <p className="text-[14px] font-semibold text-red-600 mt-1">{otpError}</p>}
              </div>
            )}

            <div className="bg-[var(--color-surface-variant)]/50 border border-[var(--color-outline-variant)]/50 rounded-lg p-5 flex items-start gap-4">
              <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] mt-0.5">shield_person</span>
              <div>
                <h4 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] mb-1">Seller Verification</h4>
                <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] text-sm">Seller verification is managed from Seller Verification. Complete that process to post commercial listings.</p>
                <Link className="inline-block mt-3 text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-container)] transition-colors" href="/seller-verification">
                  Manage Seller Status &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Card 2: Edit Profile Details */}
      {isEditing ? (
        <section className="bg-[var(--color-surface-container-lowest)] rounded-[3rem] p-[32px] card-shadow">
          <div className="mb-8 border-b border-[var(--color-outline-variant)]/30 pb-6">
            <h2 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-on-surface)] mb-2">Edit Profile Details</h2>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)]">Update your personal information and how you appear to others on PawHub.</p>
          </div>

          <form className="flex flex-col gap-8" onSubmit={handleProfileSave}>
            {/* Profile Picture Upload */}
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-4">
              <label className="w-full sm:w-auto flex-1 file-dropzone border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] rounded-[1rem] p-8 flex flex-col items-center justify-center text-center hover:bg-[var(--color-surface-container-highest)] transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-16 h-16 bg-[var(--color-primary-fixed)] rounded-full flex items-center justify-center mb-4 overflow-hidden relative">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Preview"
                      fill
                      unoptimized
                      loader={({ src }) => src}
                      className="object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                  )}
                </div>
                <button className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-primary)] mb-2" type="button" disabled>
                  {isUploadingImage ? "Uploading..." : profileImage ? "Change Photo" : "Upload Photo"}
                </button>
                <p className="text-[14px] leading-[1.6] text-[var(--color-on-surface-variant)]">Recommended: Square image, at least 400x400px. JPG/PNG.</p>
              </label>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1 */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] ml-4" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  required
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 rounded-lg px-6 py-4 text-[16px] leading-[1.6] text-[var(--color-on-surface)] input-glow outline-none transition-shadow"
                  placeholder="e.g. Jane Doe"
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] ml-4" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={profileEmail}
                  onChange={(event) => setProfileEmail(event.target.value)}
                  className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 rounded-lg px-6 py-4 text-[16px] leading-[1.6] text-[var(--color-on-surface)] input-glow outline-none transition-shadow"
                  placeholder="name@example.com"
                />
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] ml-4" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={profilePhone}
                  onChange={(event) => setProfilePhone(event.target.value)}
                  className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 rounded-lg px-6 py-4 text-[16px] leading-[1.6] text-[var(--color-on-surface)] input-glow outline-none transition-shadow"
                  placeholder="(555) 000-0000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] ml-4" htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={profileCity}
                  onChange={(event) => setProfileCity(event.target.value)}
                  list="profile-city-options"
                  className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 rounded-lg px-6 py-4 text-[16px] leading-[1.6] text-[var(--color-on-surface)] input-glow outline-none transition-shadow"
                  placeholder="e.g. Austin"
                />
              </div>

              {/* Row 3 */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] ml-4" htmlFor="state">State / Province</label>
                <input
                  id="state"
                  type="text"
                  value={profileState}
                  onChange={(event) => setProfileState(event.target.value)}
                  list="profile-state-options"
                  className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 rounded-lg px-6 py-4 text-[16px] leading-[1.6] text-[var(--color-on-surface)] input-glow outline-none transition-shadow cursor-pointer"
                  placeholder="e.g. Texas"
                />
              </div>

              {/* Row 4 */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] ml-4" htmlFor="password">New Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 rounded-lg px-6 py-4 text-[16px] leading-[1.6] text-[var(--color-on-surface)] input-glow outline-none transition-shadow"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              {/* Row 5 */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] ml-4" htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={profileBio}
                  onChange={(event) => setProfileBio(event.target.value)}
                  className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 rounded-lg px-6 py-4 text-[16px] leading-[1.6] text-[var(--color-on-surface)] input-glow outline-none transition-shadow resize-y min-h-[120px]"
                  placeholder="Tell us a bit about yourself and your experience with pets..."
                />
              </div>
            </div>

            {formError ? <p className="text-[14px] font-semibold text-[var(--color-error)] mt-2">{formError}</p> : null}
            {formSuccess ? <p className="text-[14px] font-semibold text-emerald-700 mt-2">{formSuccess}</p> : null}

            {/* Form Actions */}
            <div className="pt-6 border-t border-[var(--color-outline-variant)]/30 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || isUploadingImage}
                className="btn-gradient px-8 py-4 rounded-full text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-primary)] flex items-center gap-2 disabled:opacity-60 disabled:hover:transform-none group"
              >
                {isSaving ? "Saving..." : "Save Changes"}
                {!isSaving && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
              </button>
            </div>
          </form>

          <datalist id="profile-state-options">
            {stateOptions.map((state) => (
              <option key={state} value={state} />
            ))}
          </datalist>
          <datalist id="profile-city-options">
            {cityOptions.map((cityValue) => (
              <option key={cityValue} value={cityValue} />
            ))}
          </datalist>
        </section>
      ) : null}
    </div>
  );
`;

const returnIndex = content.indexOf('  return (');
if (returnIndex === -1) {
  console.log("Error: could not find return block");
  process.exit(1);
}

const finalContent = content.substring(0, returnIndex) + newReturnBlock + "\\n}\\n";
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("Successfully updated profile-workspace.tsx");
