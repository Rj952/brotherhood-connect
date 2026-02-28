import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyAuth(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await sql`
      SELECT g.*, 
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count,
        EXISTS(SELECT 1 FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = ${user.id}) as is_member
      FROM groups g ORDER BY g.member_count DESC, g.name ASC
    `;
    return NextResponse.json({ groups: rows });
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

    const { country } = await req.json();
    if (!country) return NextResponse.json({ error: "Country required" }, { status: 400 });

    // Create group if it doesn't exist, then join
    let group;
    const existing = await sql`SELECT * FROM groups WHERE country = ${country}`;
    if (existing.rows.length > 0) {
      group = existing.rows[0];
    } else {
      const name = country + " Brotherhood";
      const desc = "Brotherhood Connect community for men in " + country;
      const result = await sql`INSERT INTO groups (name, country, description) VALUES (${name}, ${country}, ${desc}) RETURNING *`;
      group = result.rows[0];
    }

    // Join group
    const alreadyMember = await sql`SELECT 1 FROM group_members WHERE group_id = ${group.id} AND user_id = ${user.id}`;
    if (alreadyMember.rows.length === 0) {
      await sql`INSERT INTO group_members (group_id, user_id) VALUES (${group.id}, ${user.id})`;
      await sql`UPDATE groups SET member_count = member_count + 1 WHERE id = ${group.id}`;
    }

    // Update user country
    await sql`UPDATE users SET country = ${country} WHERE id = ${user.id}`;

    return NextResponse.json({ group, joined: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
