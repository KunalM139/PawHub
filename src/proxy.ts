import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;
    const role = token?.role;

    // Authenticated users accessing Auth pages
    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
      if (token) {
        if (role === "admin") {
          return NextResponse.redirect(new URL("/admin", req.url));
        } else if (role === "verifiedSeller") {
          return NextResponse.redirect(new URL("/seller-dashboard", req.url));
        } else {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
      return NextResponse.next();
    }

    // Role-based protection: Admin routes
    if (pathname.startsWith("/admin")) {
      if (role !== "admin") {
        return NextResponse.redirect(
          new URL(role === "verifiedSeller" ? "/seller-dashboard" : "/dashboard", req.url)
        );
      }
    }

    // Role-based protection: Seller Dashboard
    if (pathname.startsWith("/seller-dashboard")) {
      // Allow admin to view seller dashboard as well, but primarily requires userType === "seller"
      if (token?.userType !== "seller" && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      // Return true if the user is authorized. Returning false automatically redirects to signIn page (/login).
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // If the path is /login or /register, let them pass this check. 
        // We handle redirecting already-logged-in users inside the main middleware function above.
        if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
          return true;
        }

        // For all other matched paths, ensure a token exists
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths for private areas.
     */
    "/dashboard/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/seller-dashboard/:path*",
    "/admin/:path*",
    "/post-listing/:path*",
    
    /*
     * Match auth pages to redirect logged in users away from them
     */
    "/login",
    "/register"
  ],
};
