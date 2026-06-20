import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import type { UserRole, UserType } from "@/types";
import { isGoogleOAuthConfigured } from "@/lib/oauth";
import { verifyPassword } from "@/lib/password";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";

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
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);

      if (!parsed.success) {
        return null;
      }

      await connectToDatabase();
      const user = await UserModel.findOne({ email: parsed.data.email }).lean();

      if (!user?.password) {
        return null;
      }

      const passwordMatch = await verifyPassword(parsed.data.password, user.password);
      if (!passwordMatch) {
        return null;
      }

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

      await UserModel.findOneAndUpdate(
        { email: user.email.toLowerCase() },
        {
          $set: {
            name: user.name ?? "PawHub User",
            image: user.image ?? null,
            emailVerifiedAt: new Date(),
            role: "user",
          },
          $setOnInsert: {
            userType: "petOwner",
            userIntent: "adopt",
          },
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        },
      );

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

