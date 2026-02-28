import { NextResponse } from "next/server";
import { verifyPassword, setSessionCookie, isAdminLogin } from "@/lib/auth";
import { getUserByEmail, updateLastLogin } from "@/lib/db";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Check admin login
    if (isAdminLogin(email, password)) {
      await setSessionCookie(0, email, "admin");
      return NextResponse.json({
        user: { id: 0, name: "Administrator", email, role: "admin", status: "approved" },
      });
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "No account found. Please register first." }, { status: 401 });
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    // Check status
    if (user.status === "pending") {
      return NextResponse.json({
        error: "Your account is awaiting approval. You'll receive an email once approved.",
      }, { status: 403 });
    }
    if (user.status === "denied") {
      return NextResponse.json({
        error: "Your registration was not approved. Please contact the administrator.",
      }, { status: 403 });
    }

    // Set session cookie
    await setSessionCookie(user.id, user.email, user.role);
    await updateLastLogin(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        first_login: user.first_login,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
