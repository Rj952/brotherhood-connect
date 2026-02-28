import { NextResponse } from "next/server";
import { getSession, generateInviteCode } from "@/lib/auth";
import { getAllCodes, createInviteCode, deleteInviteCode } from "@/lib/db";

// GET /api/admin/codes
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const codes = await getAllCodes();
  return NextResponse.json({ codes });
}

// POST /api/admin/codes â generate a new code
export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const code = generateInviteCode();
    const result = await createInviteCode(code, "Admin");
    return NextResponse.json({ code: result });
  } catch (error) {
    console.error("Code generation error:", error);
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }
}

// DELETE /api/admin/codes â delete a code
export async function DELETE(request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code } = await request.json();
    await deleteInviteCode(code);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Code deletion error:", error);
    return NextResponse.json({ error: "Failed to delete code" }, { status: 500 });
  }
}
