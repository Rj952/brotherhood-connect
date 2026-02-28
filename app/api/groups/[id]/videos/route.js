import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { rows } = await sql`
      SELECT v.*, u.name as poster_name
      FROM group_videos v LEFT JOIN users u ON u.id = v.user_id
      WHERE v.group_id = ${id} ORDER BY v.created_at DESC
    `;
    return NextResponse.json({ videos: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { title, description, youtubeUrl } = await req.json();
    if (!title || !youtubeUrl) {
      return NextResponse.json({ error: "Title and YouTube URL required" }, { status: 400 });
    }
    const { rows } = await sql`
      INSERT INTO group_videos (group_id, user_id, title, description, youtube_url)
      VALUES (${id}, ${user.userId}, ${title}, ${description || null}, ${youtubeUrl})
      RETURNING *
    `;
    return NextResponse.json({ video: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });
    const { rows } = await sql`SELECT * FROM group_videos WHERE id = ${videoId} AND group_id = ${id}`;
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user.role !== "admin" && rows[0].user_id !== user.userId) {
      return NextResponse.json({ error: "Can only delete your own videos or be admin" }, { status: 403 });
    }
    await sql`DELETE FROM group_videos WHERE id = ${videoId} AND group_id = ${id}`;
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
