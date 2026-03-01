import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    if (!groupId) return NextResponse.json({ error: "groupId required" }, { status: 400 });
    const { rows } = await sql`
      SELECT p.*, COALESCE(u.name, 'Administrator') as author_name,
        (SELECT COUNT(*) FROM replies r WHERE r.post_id = p.id) as reply_count
      FROM posts p
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.group_id = ${groupId}
      ORDER BY p.created_at DESC
    `;
    const response = NextResponse.json({ posts: rows });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
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

export async function DELETE(req) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });
    await sql`DELETE FROM replies WHERE post_id = ${postId}`;
    await sql`DELETE FROM posts WHERE id = ${postId}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
