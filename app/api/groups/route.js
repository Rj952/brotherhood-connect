import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await sql`
      SELECT g.*,
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count,
        EXISTS(SELECT 1 FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = ${user.userId}) as is_member
      FROM groups g ORDER BY g.member_count DESC, g.name ASC
    `;

    return NextResponse.json({ groups: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { country } = await req.json();
    if (!country) return NextResponse.json({ error: "Country required" }, { status: 400 });

    // Create group if it doesn't exist, then join
    let { rows: existing } = await sql`SELECT * FROM groups WHERE country = ${country}`;
    let group;

    if (existing.length === 0) {
      const name = country + " Brotherhood";
      const description = "Brotherhood Connect community for members in " + country;
      const { rows: created } = await sql`
        INSERT INTO groups (name, country, description) VALUES (${name}, ${country}, ${description}) RETURNING *
      `;
      group = created[0];
    } else {
      group = existing[0];
    }

    // Join group
    try {
      await sql`INSERT INTO group_members (group_id, user_id) VALUES (${group.id}, ${user.userId})`;
    } catch (e) {
      if (!e.message.includes("duplicate")) throw e;
    }

    // Update user country
    await sql`UPDATE users SET country = ${country} WHERE id = ${user.userId}`;

    return NextResponse.json({ group, joined: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
