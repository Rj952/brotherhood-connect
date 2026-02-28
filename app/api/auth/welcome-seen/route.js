import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { markFirstLoginComplete } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await markFirstLoginComplete(session.userId);
  return NextResponse.json({ success: true });
}
