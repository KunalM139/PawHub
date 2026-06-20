"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useMemo, useState, useEffect, useRef, type FormEvent } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type ListingItem = {
  _id: string;
  title: string;
  breed: string;
  city: string;
  state: string;
  status: string;
};

type FavoriteItem = {
  _id: string;
  listingId:
    | {
        _id: string;
        title: string;
        priceInr: number;
      }
    | string;
};

type MessageItem = {
  _id: string;
  body: string;
  createdAt: string;
  listingId?: { _id: string; title: string } | string;
  senderId?: { _id?: string; name?: string } | string;
  receiverId?: { _id?: string; name?: string } | string;
};

type Profile = {
  name: string;
  email: string;
  image?: string | null;
  role: string;
  phone?: string;
  city?: string;
  bio?: string;
  isPhoneVerified?: boolean;
};

type DashboardTab = "myListings" | "favorites" | "messages" | "profile";

type DashboardWorkspaceProps = {
  initialTab: DashboardTab;
  initialListings: ListingItem[];
  initialFavorites: FavoriteItem[];
  initialMessages: MessageItem[];
  initialProfile: Profile;
  listingIdParam: string;
  receiverIdParam: string;
};

function getName(value: MessageItem["senderId"] | MessageItem["receiverId"]) {
  if (!value || typeof value === "string") {
    return "User";
  }

  return value.name ?? "User";
}

function getListingTitle(value: MessageItem["listingId"]) {
  if (!value || typeof value === "string") {
    return "Listing";
  }

  return value.title;
}

export function DashboardWorkspace({
  initialTab,
  initialListings,
  initialFavorites,
  initialMessages,
  initialProfile,
  listingIdParam,
  receiverIdParam,
}: DashboardWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [listings] = useState(initialListings);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [messages, setMessages] = useState(initialMessages);
  const [profile, setProfile] = useState(initialProfile);
  const [profileName, setProfileName] = useState(initialProfile.name);
  const [profileImage, setProfileImage] = useState(initialProfile.image ?? "");
  const [profilePhone, setProfilePhone] = useState(initialProfile.phone ?? "");
  const [profileCity, setProfileCity] = useState(initialProfile.city ?? "");
  const [profileBio, setProfileBio] = useState(initialProfile.bio ?? "");
  const [messageBody, setMessageBody] = useState("");
  const [listingId, setListingId] = useState(listingIdParam);
  const [receiverId, setReceiverId] = useState(receiverIdParam);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { socket, onlineUsers } = useSocket();
  const currentUserId = initialProfile.email ? initialProfile.email.split("@")[0] : "seller"; // Simple fallback, usually session.user.id is passed but we don't have it as prop.
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", (data: any) => {
      // If the message is for this receiver
      setMessages((prev) => [data, ...prev]);
      
      // If we are actively chatting with them, emit read
      if (activeTab === "messages") {
        socket.emit("read-messages", { senderId: data.senderId, receiverId: currentUserId, listingId: data.listingId });
      }
    });

    socket.on("typing", (data: any) => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    return () => {
      socket.off("receive-message");
      socket.off("typing");
    };
  }, [socket, activeTab, currentUserId]);

  const tabs: Array<{ id: DashboardTab; label: string }> = useMemo(
    () => [
      { id: "myListings", label: "My Listings" },
      { id: "favorites", label: "Favorites" },
      { id: "messages", label: "Messages" },
      { id: "profile", label: "Edit Profile" },
    ],
    [],
  );

  async function removeFavorite(listingIdValue: string) {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/favorites/${listingIdValue}`, {
      method: "DELETE",
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to remove favorite.");
      return;
    }

    setFavorites((current) =>
      current.filter((item) => {
        if (typeof item.listingId === "string") {
          return item.listingId !== listingIdValue;
        }

        return item.listingId._id !== listingIdValue;
      }),
    );
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsBusy(true);

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingId,
        receiverId,
        body: messageBody,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | {
          message?:
            | {
                _id: string;
                body: string;
                createdAt: string;
              }
            | string;
        }
      | null;

    if (!response.ok) {
      setError(typeof data?.message === "string" ? data.message : "Unable to send message.");
      setIsBusy(false);
      return;
    }

    setMessageBody("");
    setSuccess("Message sent.");

    const createdMessage =
      data && data.message && typeof data.message === "object" ? data.message : null;

    if (createdMessage) {
      const newMsg = {
        _id: createdMessage._id,
        body: createdMessage.body,
        createdAt: createdMessage.createdAt,
        senderId: { name: "You" },
        receiverId: { name: "Buyer" },
        listingId: { _id: listingId, title: "Listing" },
      };
      
      setMessages((current) => [newMsg, ...current]);
      
      if (socket) {
        socket.emit("send-message", {
          ...newMsg,
          receiverId, // Pass the raw ID to socket routing
          senderId: currentUserId
        });
      }
    }

    setIsBusy(false);
  }

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsBusy(true);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: profileName,
        image: profileImage || null,
        phone: profilePhone,
        city: profileCity,
        bio: profileBio,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | {
          profile?: Profile;
          message?: string;
        }
      | null;

    if (!response.ok || !data?.profile) {
      setError(data?.message ?? "Unable to update profile.");
      setIsBusy(false);
      return;
    }

    setProfile(data.profile);
    setProfileName(data.profile.name);
    setProfileImage(data.profile.image ?? "");
    setProfilePhone(data.profile.phone ?? "");
    setProfileCity(data.profile.city ?? "");
    setProfileBio(data.profile.bio ?? "");
    setSuccess("Profile updated.");
    setIsBusy(false);
  }

  async function confirmDeleteAccount() {
    setError(null);
    setSuccess(null);
    setIsBusy(true);

    const response = await fetch("/api/profile", {
      method: "DELETE",
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to delete account.");
      setIsBusy(false);
      setShowDeleteConfirm(false);
      return;
    }

    await signOut({ callbackUrl: "/" });
  }

  function deleteAccount() {
    setShowDeleteConfirm(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              activeTab === tab.id
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "bg-white text-[var(--color-foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      {activeTab === "myListings" ? (
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">My Listings</h2>
            <Link href="/post-listing" className="text-sm font-semibold">
              Manage Listings
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {listings.length === 0 ? (
              <p className="text-sm text-[var(--color-foreground-muted)]">No listings yet.</p>
            ) : (
              listings.map((listing) => (
                <article key={listing._id} className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
                  <h3 className="text-base font-bold">{listing.title}</h3>
                  <p className="text-sm text-[var(--color-foreground-muted)]">
                    {listing.breed} • {listing.city}, {listing.state}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide">{listing.status}</p>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "favorites" ? (
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-black tracking-tight">Favorites</h2>
          <div className="mt-4 space-y-3">
            {favorites.length === 0 ? (
              <p className="text-sm text-[var(--color-foreground-muted)]">No favorites saved yet.</p>
            ) : (
              favorites.map((item) => {
                const listing = typeof item.listingId === "string" ? null : item.listingId;
                const listingIdValue =
                  typeof item.listingId === "string" ? item.listingId : item.listingId._id;

                return (
                  <article key={item._id} className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
                    <h3 className="text-base font-bold">{listing?.title ?? "Saved Listing"}</h3>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      {listing ? `INR ${Number(listing.priceInr).toLocaleString("en-IN")}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href={`/listings/${listingIdValue}`}
                        className="inline-flex rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => void removeFavorite(listingIdValue)}
                        className="inline-flex rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "messages" ? (
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-black tracking-tight">Messages</h2>

          <form className="mt-4 grid gap-3 rounded-2xl bg-[var(--color-surface-muted)] p-4" onSubmit={submitMessage}>
            <h3 className="text-sm font-bold uppercase tracking-wide">Send Message</h3>
            <input
              value={listingId}
              onChange={(event) => setListingId(event.target.value)}
              placeholder="Listing ID"
              className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
              required
            />
            <input
              value={receiverId}
              onChange={(event) => setReceiverId(event.target.value)}
              placeholder="Receiver User ID"
              className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
              required
            />
            <textarea
              value={messageBody}
              onChange={(event) => {
                setMessageBody(event.target.value);
                if (socket && event.target.value.length > 0) {
                  socket.emit("typing", { senderId: currentUserId, receiverId, listingId });
                }
              }}
              placeholder="Write your message"
              className="min-h-24 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none"
              required
            />
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] disabled:opacity-60"
            >
              Send
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-[var(--color-foreground-muted)]">No messages yet.</p>
            ) : (
              messages.map((message) => (
                <article key={message._id} className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-subtle)]">
                    {getName(message.senderId)} to {getName(message.receiverId)} • {getListingTitle(message.listingId)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{message.body}</p>
                </article>
              ))
            )}
            {isTyping && (
              <article className="rounded-2xl bg-[var(--color-surface-muted)] p-4 flex justify-start">
                <div className="flex gap-1 items-center">
                  <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </article>
            )}
            <div ref={messagesEndRef} />
          </div>
        </section>
      ) : null}

      {activeTab === "profile" ? (
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-black tracking-tight">Edit Profile</h2>
          <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
            Role: {profile.role} • {profile.email}
          </p>
          <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
            Phone: {profile.isPhoneVerified ? "Verified" : "Not verified"} • Manage verification in
            {" "}
            <Link href="/profile" className="font-semibold text-[var(--color-primary)]">
              My Profile
            </Link>
          </p>

          <form className="mt-4 space-y-3" onSubmit={updateProfile}>
            <label className="block text-sm font-semibold">
              Name
              <input
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              Profile Image URL
              <input
                value={profileImage}
                onChange={(event) => setProfileImage(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Phone
                <input
                  value={profilePhone}
                  onChange={(event) => setProfilePhone(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
                  placeholder="+91 98765 43210"
                />
              </label>
              <label className="block text-sm font-semibold">
                City
                <input
                  value={profileCity}
                  onChange={(event) => setProfileCity(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
                  placeholder="Mumbai"
                />
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Bio
              <textarea
                value={profileBio}
                onChange={(event) => setProfileBio(event.target.value)}
                className="mt-2 min-h-24 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none"
                placeholder="Share a little about your pets or rehoming story"
              />
            </label>
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] disabled:opacity-60"
            >
              Save Profile
            </button>
          </form>

          <div className="mt-6 border-t border-black/5 pt-4">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void deleteAccount()}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 disabled:opacity-60"
            >
              Delete Account
            </button>
          </div>
        </section>
      ) : null}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account permanently? This action cannot be undone."
        confirmText="Delete Account"
        isDestructive={true}
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
