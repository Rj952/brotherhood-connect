import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows: newsItems } = await sql`
      SELECT n.id, n.title, n.content, n.news_type, n.youtube_url, n.created_at,
             g.name as group_name, g.id as group_id, 'news' as item_type
      FROM group_news n
      JOIN groups g ON g.id = n.group_id
      ORDER BY n.created_at DESC LIMIT 20
    `;

    const { rows: videoItems } = await sql`
      SELECT v.id, v.title, v.description as content, v.youtube_url, v.created_at,
             g.name as group_name, g.id as group_id, u.name as poster_name, 'video' as item_type
      FROM group_videos v
      JOIN groups g ON g.id = v.group_id
      LEFT JOIN users u ON u.id = v.user_id
      ORDER BY v.created_at DESC LIMIT 20
    `;

    return NextResponse.json({ news: newsItems, videos: videoItems });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
