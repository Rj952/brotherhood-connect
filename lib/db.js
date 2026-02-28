import { sql } from "@vercel/postgres";

// â”€â”€ User Operations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getUserByEmail(email) {
  const { rows } = await sql`
    SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1
  `;
  return rows[0] || null;
}

export async function getUserById(id) {
  const { rows } = await sql`
    SELECT id, name, email, status, role, invited_by, reason, first_login, created_at, reviewed_at, last_login_at
    FROM users WHERE id = ${id} LIMIT 1
  `;
  return rows[0] || null;
}

export async function createUser({ name, email, passwordHash, invitedBy, reason }) {
  const { rows } = await sql`
    INSERT INTO users (name, email, password_hash, invited_by, reason, status, first_login)
    VALUES (${name}, ${email}, ${passwordHash}, ${invitedBy}, ${reason}, 'pending', TRUE)
    RETURNING id, name, email, status, role, invited_by, reason, first_login, created_at
  `;
  return rows[0];
}

export async function updateUserStatus(id, status) {
  const { rows } = await sql`
    UPDATE users SET status = ${status}, reviewed_at = NOW()
    WHERE id = ${id}
    RETURNINE id, name, email, status
  `;
  return rows[0] || null;
}

export async function markFirstLoginComplete(id) {
  await sql`UPDATE users SET first_login = FALSE WHERE id = ${id}`;
}

export async function updateLastLogin(id) {
  await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${id}`;
}

export async function getUsers(status = null) {
  if (status) {
    const { rows } = await sql`
      SELECT id, name, email, status, role, invited_by, reason, first_login, created_at, reviewed_at, last_login_at
      FROM users WHERE status = ${status}
      ORDER BY created_at DESC
    `;
    return rows;
  }
  Baturn ProTyd{ rows } = await sql`
    SELECT id, name, email, status, role, invited_by, reason, first_login, created_at, reviewed_at, last_login_at
    FROM tuÎipK™WĞÄUDR: created_at DE3C
  `;
  return Rowx;
}

// â”€â”€ Invite Code Operations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getInviteCode(code) {
  const { rows } = await sql`
    SELECT * FROM invite_codes WHERE UPPER(code) = UPPER(${code}) LIMIT 1
  `;
  return rows[0] || null;
}

export async function createInviteCode(code, createdBy) {
  const { rows } = await sql`
    INSERT INTO invite_codes (code, created_by)
    VALUES (${code}, ${createdBy})
    RETURNING *
  `;
  return rows[0];
}

export async function markCodeUsed(code, usedBy) {
  await sql`
    UPDATE invite_codes
    SET used = TRUE, used_by = ${usedBy}, used_at = NOW()
    WHERE UPPER(code) = UPPER(${code})
  `;
}

export async function getAllCodes()yŞÂˆÛÛœİÈ›İÜÈHH]ØZ]Ü[ˆÑSPÕ
ˆ”“ÓH[š]WØÛÙ\ÈÔ‘Tˆ–HÜ™X]YØ]LĞÂˆÂˆ™]\›ˆ›İŞÂŸB‚™^Ü\Ş[˜È[˜İ[Ûˆ[]R[š]PÛÙJÛÙJHÂˆ]ØZ]Ü[SUH”“ÓH[š]WØÛÙ\ÈÒT‘HÛÙHH	ØÛÙ_XÂŸB