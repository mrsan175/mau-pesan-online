import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.id),
      columns: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat profil user." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { fullName, username } = body;

    await db
      .update(users)
      .set({
        fullName,
        username,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.id));

    return NextResponse.json({ success: "Profil user diperbarui." });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengupdate profil." }, { status: 500 });
  }
}
