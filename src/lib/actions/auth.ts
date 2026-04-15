"use server";

import { loginSchema, LoginInput, registerSchema, RegisterInput } from "@/lib/zod-schemas";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, verifyPassword, signAccessToken, revokeRefreshTokenByPlain, clearAuthCookies } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(data: LoginInput) {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
        return { error: "Invalid credentials" };
    }

    const { identifier, password } = parsed.data;

    // Check by username OR email
    const userArray = await db.select().from(users).where(
        or(
            eq(users.username, identifier),
            eq(users.email, identifier)
        )
    );

    const user = userArray[0];

    if (!user || !user.password) {
        return { error: "Invalid username/email or password" };
    }

    // Verify Password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
        return { error: "Invalid username/email or password" };
    }

    // Generate JWT edge token
    const accessToken = await signAccessToken(user.id, user.role);

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 1 day limit as in session.ts
    });

    let redirectUrl = "/";
    if (user.role === "seller") redirectUrl = "/dashboard/seller";
    else if (user.role === "admin" || user.role === "superAdmin") redirectUrl = "/dashboard/admin";

    redirect(redirectUrl);
}

export async function registerAction(data: RegisterInput) {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
        return { error: "Invalid registration data" };
    }

    const { fullName, username, email, password } = parsed.data;

    try {
        // Check if user exists
        const existing = await db.select().from(users).where(
            or(
                eq(users.username, username),
                eq(users.email, email)
            )
        );

        if (existing.length > 0) {
            return { error: "Username or email already in use" };
        }

        const hashed = await hashPassword(password);

        await db.insert(users).values({
            fullName,
            username,
            email,
            password: hashed,
            role: "user"
        });

        return { success: "Account created successfully" };
    } catch (e: any) {
        // Return inner error so we can view it directly on the form
        return { error: e.message || "Something went wrong during registration" };
    }
}


export const logoutAction = async () => {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
        await revokeRefreshTokenByPlain(refreshToken);
    }

    await clearAuthCookies();
    redirect("/login");
};
