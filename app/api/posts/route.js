import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

// Create a new post in a group
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyAuth(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { group_id, title, content } = await req.json();
    if (!group_id || !title || !content) {
      return NextResponse.json({ error: "group_id, title and content required" }, { status: 400 });
    }

    // Verify membership
    const member = await sql`SELECT 1 FROM group_members WHERE group_id = ${group_id} AND user_id = ${user.id}`;
    if (member.rows.length === 0) {
      return NextResponse.json({ error: "You must join this group to post" }, { status: 403 });
    }

    const result = await sql`
      INSERT INTO posts (group_id, user_id, title, content)
      VALUES (${group_id}, ${user.id}, ${title}, ${content})
      RETURNING *
    `;

    return NextResponse.json({ post: result.rows[0] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
