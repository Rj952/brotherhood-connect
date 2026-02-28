import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUsers, updateUserStatus, getUserById } from "@/lib/db";
import { notifyUserApproved, notifyUserDenied } from "@/lib/email";

// GET /api/admin/users?status=pending|approved|denied
export async function GET(request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const users = await getUsers(status || null);
  return NextResponse.json({ users });
}

// PATCH /api/admin/users  { userId, status }
export async function PATCH(request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, status } = await request.json();

    if (!userId || !["approved", "denied", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const user = await updateUserStatus(userId, status);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Send notifications (non-blocking)
    const fullUser = await getUserById(userId);
    if (status === "approved" && fullUser) {
      notifyUserApproved(fullUser).catch(console.error);
    } else if (status === "denied" && fullUser) {
      notifyUserDenied(fullUser).catch(console.error);
    }

    return NextResponse.json({ user, message: `User ${status} successfully.` });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
