import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

import type { UserRole, UserType } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      userType: UserType;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    userType: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: UserRole;
    userType?: UserType;
  }
}
