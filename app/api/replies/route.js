import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

// Get replies for a post, or create a reply
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyAuth(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("post_id");
    if (!postId) return NextResponse.json({ error: "post_id required" }, { status: 400 });

    const { rows } = await sql`
      SELECT r.*, u.name as author_name
      FROM replies r JOIN users u ON r.user_id = u.id
      WHERE r.post_id = ${postId} ORDER BY r.created_at ASC
    `;

    return NextResponse.json({ replies: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyAuth(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { post_id, content } = await req.json();
    if (!post_id || !content) {
      return NextResponse.json({ error: "post_id and content required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO replies (post_id, user_id, content)
      VALUES (${post_id}, ${user.id}, ${content})
      RETURNING *
    `;

    await sql`UPDATE posts SET reply_count = reply_count + 1 WHERE id = ${post_id}`;

    return NextResponse.json({ reply: result.rows[0] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
