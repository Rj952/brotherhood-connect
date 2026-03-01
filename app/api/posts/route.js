import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    if (!groupId) return NextResponse.json({ error: "groupId required" }, { status: 400 });
    const { rows } = await sql`
      SELECT p.*, u.name as author_name,
        (SELECT COUNT(*) FROM replies r WHERE r.post_id = p.id) as reply_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.group_id = ${groupId}
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json({ posts: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { groupId, title, content } = await req.json();
    if (!groupId || !content) {
      return NextResponse.json({ error: "groupId and content required" }, { status: 400 });
    }
    const postTitle = title || "";
    const { rows } = await sql`
      INSERT INTO posts (group_id, user_id, title, content) 
      VALUES (${groupId}, ${user.userId}, ${postTitle}, ${content}) RETURNING *
    `;
    return NextResponse.json({ post: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
