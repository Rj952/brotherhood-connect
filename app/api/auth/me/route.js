import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Admin session
    if (session.role === "admin" && session.userId === 0) {
      return NextResponse.json({
        user: { id: 0, name: "Administrator", email: session.email, role: "admin", status: "approved" },
      });
    }

    const user = await getUserById(session.userId);
    if (!user || user.status !== "approved") {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
