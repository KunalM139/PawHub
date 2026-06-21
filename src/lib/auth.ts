import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import type { UserRole, UserType } from "@/types";
import { isGoogleOAuthConfigured } from "@/lib/oauth";
import { verifyPassword } from "@/lib/password";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { logger } from "@/lib/logger";
import { authRateLimit } from "@/lib/ratelimit";

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
});

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, req) {
      const ip = req?.headers?.["x-forwarded-for"]?.split(",")[0] || "127.0.0.1";
      const { success } = await authRateLimit.limit(`login_${ip}`);
      if (!success) {
        throw new Error("Too many login attempts. Please try again later.");
      }

      const parsed = credentialsSchema.safeParse(credentials);

      if (!parsed.success) {
        return null;
      }

      await connectToDatabase();
      const user = await UserModel.findOne({ email: parsed.data.email.toLowerCase() })
        .select("+password")
        .lean();

      if (!user) {
        logger.warn("Login failed: User not found", { email: parsed.data.email });
        return null;
      }

      const passwordMatch = await verifyPassword(parsed.data.password, user.password);
      if (!passwordMatch) {
        logger.warn("Login failed: Incorrect password", { email: parsed.data.email, userId: user._id });
        return null;
      }

      // Trust & Safety Checks
      if (user.accountStatus === "banned") {
        logger.security("Banned user attempted login", { userId: user._id, email: user.email });
        throw new Error("Your account has been permanently banned.");
      }
      if (user.accountStatus === "suspended" && user.suspendedUntil) {
        if (new Date(user.suspendedUntil) > new Date()) {
          logger.security("Suspended user attempted login", { userId: user._id, email: user.email });
          throw new Error(`Your account is suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}. Reason: ${user.suspensionReason || 'Violation of terms'}`);
        } else {
          // Auto-unsuspend if the time has passed
          logger.info("User auto-unsuspended", { userId: user._id });
          await UserModel.findByIdAndUpdate(user._id, { $set: { accountStatus: "active", suspendedUntil: null } });
        }
      }

      logger.info("Login success", { userId: user._id, email: user.email, provider: "credentials" });

      return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role as UserRole,
        userType: (user.userType as UserType | undefined) ?? "petOwner",
      };
    },
  }),
];

if (isGoogleOAuthConfigured()) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      await connectToDatabase();

      // Trust & Safety checks for existing Google users
      const existingUser = await UserModel.findOne({ email: user.email.toLowerCase() }).lean();
      
      if (existingUser) {
        if (existingUser.accountStatus === "banned") {
          logger.security("Banned user attempted Google login", { userId: existingUser._id, email: existingUser.email });
          throw new Error("Your account has been permanently banned.");
        }
        if (existingUser.accountStatus === "suspended" && existingUser.suspendedUntil) {
          if (new Date(existingUser.suspendedUntil) > new Date()) {
            logger.security("Suspended user attempted Google login", { userId: existingUser._id, email: existingUser.email });
            throw new Error(`Your account is suspended until ${new Date(existingUser.suspendedUntil).toLocaleDateString()}.`);
          } else {
            logger.info("User auto-unsuspended during Google login", { userId: existingUser._id });
            await UserModel.findByIdAndUpdate(existingUser._id, { $set: { accountStatus: "active", suspendedUntil: null } });
          }
        }
      }

      await UserModel.findOneAndUpdate(
        { email: user.email.toLowerCase() },
        {
          $set: {
            name: user.name ?? "PawHub User",
            image: user.image ?? null,
            emailVerifiedAt: new Date(),
            role: existingUser ? existingUser.role : "user",
          },
          $setOnInsert: {
            userType: "petOwner",
            userIntent: "adopt",
            accountStatus: "active",
            strikeCount: 0,
            warningCount: 0,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        },
      );

      logger.info("Login success", { email: user.email.toLowerCase(), provider: "google" });

      return true;
    },
    async jwt({ token, user }) {
      if (token.email) {
        await connectToDatabase();
        const dbUser = await UserModel.findOne({ email: token.email })
          .select("_id role userType")
          .lean();

        if (dbUser) {
          token.sub = String(dbUser._id);
          token.role = dbUser.role as UserRole;
          token.userType = (dbUser.userType as UserType | undefined) ?? "petOwner";
          return token;
        }
      }

      if (user) {
        token.role = (user.role as UserRole | undefined) ?? "user";
        token.userType = (user.userType as UserType | undefined) ?? "petOwner";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as UserRole | undefined) ?? "user";
        session.user.userType = (token.userType as UserType | undefined) ?? "petOwner";
      }

      return session;
    },
  },
};

import { getServerSession } from "next-auth";
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

