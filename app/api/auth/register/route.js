import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getUserByEmail, createUser, getInviteCode, markCodeUsed } from "@/lib/db";
import { notifyAdminNewRegistration, notifyUserRegistered } from "@/lib/email";

export async function POST(request) {
  try {
    const { name, email, password, inviteCode, reason } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // Check if user already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Validate invite code if provided
    let invitedBy = "Direct registration";
    if (inviteCode && inviteCode.trim()) {
      const code = await getInviteCode(inviteCode.trim());
      if (!code) {
        return NextResponse.json({ error: "Invalid invite code. Leave blank if you don't have one." }, { status: 400 });
      }
      if (code.used) {
        return NextResponse.json({ error: "This invite code has already been used." }, { status: 400 });
      }
      invitedBy = `Code: ${code.code} (created by ${code.created_by})`;
      await markCodeUsed(code.code, email.trim());
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      invitedBy,
      reason: reason?.trim() || null,
    });

    // Send email notifications (non-blocking)
    notifyAdminNewRegistration(user).catch(console.error);
    notifyUserRegistered(user).catch(console.error);

    return NextResponse.json({
      message: "Registration submitted! You'll gain access once approved by the administrator.",
      user: { id: user.id, name: user.name, email: user.email, status: user.status },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
