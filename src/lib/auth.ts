import bcrypt from "bcryptjs";
import { randomBytes, createHash, randomUUID } from "crypto";
import { db } from "@/lib/db";
import { refreshTokens, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signJwt, verifyJwt } from "@/lib/session";
import { cookies } from "next/headers";

const REFRESH_TOKEN_DAYS = 30;

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

export async function signAccessToken(userId: string, role: string = "user") {
    return signJwt({ sub: userId, role });
}

export async function verifyAccessToken(token: string) {
    return verifyJwt(token);
}

export async function createAndStoreRefreshToken(userId: string) {
    const token = randomBytes(64).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const id = randomUUID();
    const expiresAt = new Date(
        Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    );

    await db.insert(refreshTokens).values({ id, userId, tokenHash, expiresAt });

    return { token, id, expiresAt };
}

export async function rotateRefreshToken(oldToken: string, userId: string) {
    const oldHash = createHash("sha256").update(oldToken).digest("hex");

    await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.tokenHash, oldHash));

    return createAndStoreRefreshToken(userId);
}

export async function findRefreshTokenByPlain(plain: string) {
    const tokenHash = createHash("sha256").update(plain).digest("hex");
    const [row] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash));
    return row ?? null;
}

export async function revokeRefreshTokenByPlain(plain: string) {
    const tokenHash = createHash("sha256").update(plain).digest("hex");
    await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function setAuthCookies(accessToken: string, refreshToken: string, refreshExpiresAt: Date) {
    const cookieStore = await cookies();
    cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 1 day
    });
    cookieStore.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: refreshExpiresAt,
    });
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshTokenPlain = cookieStore.get("refresh_token")?.value;

    if (accessToken) {
        try {
            const payload = await verifyAccessToken(accessToken);
            if (payload && payload.sub) {
                const user = await db.query.users.findFirst({
                    where: eq(users.id, payload.sub),
                });
                if (user && user.isActive) return user;
            }
        } catch {
        }
    }

    if (refreshTokenPlain) {
        const stored = await findRefreshTokenByPlain(refreshTokenPlain);
        if (stored && !stored.revoked && stored.expiresAt > new Date()) {
            const user = await db.query.users.findFirst({
                where: eq(users.id, stored.userId),
            });
            if (user && user.isActive) {
                const newRefresh = await rotateRefreshToken(
                    refreshTokenPlain,
                    user.id,
                );
                const newAccess = await signAccessToken(user.id, user.role);
                await setAuthCookies(newAccess, newRefresh.token, newRefresh.expiresAt);
                return user;
            }
        }
    }

    return null;
}