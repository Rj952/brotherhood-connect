import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

    const { rows } = await sql`
      SELECT r.*, u.name as author_name
      FROM replies r
      JOIN users u ON u.id = r.user_id
      WHERE r.post_id = ${postId}
      ORDER BY r.created_at ASC
    `;

    return NextResponse.json({ replies: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId, content } = await req.json();
    if (!postId || !content) {
      return NextResponse.json({ error: "postId and content required" }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO replies (post_id, user_id, content) 
      VALUES (${postId}, ${user.userId}, ${content}) RETURNING *
    `;

    return NextResponse.json({ reply: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
