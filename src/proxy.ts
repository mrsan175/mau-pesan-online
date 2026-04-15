import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/session";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/register"];

export async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

    // Try to get token from Authorization header or cookies
    const authHeader = req.headers.get("authorization");
    let token = authHeader?.split(" ")[1];
    if (!token) {
        token = req.cookies.get("access_token")?.value;
    }

    // Allow public routes and non-protected routes to pass immediately
    // BUT if the user is already logged in and tries to access /login or /register, send them to dashboard
    const isPublicAuthRoute = publicRoutes.includes(path);
    if (isPublicAuthRoute && token) {
        try {
            const payload = await verifyJwt(token);
            if (payload) {
                const role = payload.role as string;
                let redirectUrl = "/";
                if (role === "seller") redirectUrl = "/dashboard/seller";
                else if (role === "admin" || role === "superAdmin") redirectUrl = "/dashboard/admin";
                return NextResponse.redirect(new URL(redirectUrl, req.url));
            }
        } catch (e) {
            // Ignore format errors etc., let them see the public page
        }
    }

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    if (!token) {
        const url = new URL("/login", req.url);
        url.searchParams.set("callbackUrl", path);
        return NextResponse.redirect(url);
    }

    try {
        const payload = await verifyJwt(token);
        if (!payload) {
            // Token invalid or expired
            const url = new URL("/login", req.url);
            url.searchParams.set("callbackUrl", path);
            url.searchParams.set("error", "SessionExpired");
            return NextResponse.redirect(url);
        }
        
        const role = payload.role as string;

        // Route Protection based on roles
        if (path.startsWith("/dashboard/seller") && role !== "seller" && role !== "admin" && role !== "superAdmin") {
            return NextResponse.redirect(new URL("/", req.url)); // not a seller or admin
        }
        if (path.startsWith("/dashboard/admin") && role !== "admin" && role !== "superAdmin") {
            return NextResponse.redirect(new URL("/", req.url)); // not an admin
        }
        
        // If they just hit /dashboard, redirect to proper place automatically
        if (path === "/dashboard") {
            let redirectUrl = "/";
            if (role === "seller") redirectUrl = "/dashboard/seller";
            else if (role === "admin" || role === "superAdmin") redirectUrl = "/dashboard/admin";
            return NextResponse.redirect(new URL(redirectUrl, req.url));
        }

        // Super advanced: Pass user info to headers so that route handlers/Server Components can access without re-verifying
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-user-id", payload.sub as string);
        if (payload.role) {
            requestHeaders.set("x-user-role", payload.role as string);
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
