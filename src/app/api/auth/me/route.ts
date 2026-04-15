import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/me
 * Returns the current logged-in user's basic info.
 * Used by client components that need user data (replaces NextAuth useSession).
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    role: user.role,
    image: user.image,
    isActive: user.isActive,
  });
}
