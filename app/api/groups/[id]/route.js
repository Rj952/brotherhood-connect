import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Get group info
    const { rows: groups } = await sql`SELECT * FROM groups WHERE id = ${id}`;
    if (groups.length === 0) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    // Get members
    const { rows: members } = await sql`
      SELECT u.id, u.name, u.email, gm.joined_at 
      FROM group_members gm 
      JOIN users u ON u.id = gm.user_id 
      WHERE gm.group_id = ${id}
      ORDER BY gm.joined_at DESC
    `;

    // Check if current user is member
    const isMember = members.some(m => m.id === user.userId);

    return NextResponse.json({ group: groups[0], members, isMember });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { action } = await req.json();

    if (action === "join") {
      try {
        await sql`INSERT INTO group_members (group_id, user_id) VALUES (${id}, ${user.userId})`;
      } catch (e) {
        if (!e.message.includes("duplicate")) throw e;
      }
      return NextResponse.json({ joined: true });
    } else if (action === "leave") {
      await sql`DELETE FROM group_members WHERE group_id = ${id} AND user_id = ${user.userId}`;
      return NextResponse.json({ left: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
