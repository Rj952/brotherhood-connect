import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { rows } = await sql`
      SELECT n.*, u.name as author_name
      FROM group_news n LEFT JOIN users u ON u.id = n.user_id
      WHERE n.group_id = ${id} ORDER BY n.created_at DESC
    `;
    return NextResponse.json({ news: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can post news" }, { status: 403 });
    }
    const { id } = await params;
    const { title, content, youtubeUrl, newsType } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }
    const { rows } = await sql`
      INSERT INTO group_news (group_id, user_id, title, content, youtube_url, news_type)
      VALUES (${id}, ${user.userId}, ${title}, ${content}, ${youtubeUrl || null}, ${newsType || "update"})
      RETURNING *
    `;
    return NextResponse.json({ newsItem: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete news" }, { status: 403 });
    }
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const newsId = searchParams.get("newsId");
    if (!newsId) return NextResponse.json({ error: "newsId required" }, { status: 400 });
    await sql`DELETE FROM group_news WHERE id = ${newsId} AND group_id = ${id}`;
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
