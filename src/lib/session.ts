import { SignJWT, jwtVerify } from "jose";

export function getJwtSecretKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }
    return new TextEncoder().encode(secret);
}

export async function signJwt(payload: any, expiresIn = "1d") {
    const secret = getJwtSecretKey();
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secret);
}

export async function verifyJwt(token: string) {
    try {
        const secret = getJwtSecretKey();
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}
