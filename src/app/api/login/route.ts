import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === "admin" && password === "password") {
    const response = NextResponse.json({ success: true });
    response.cookies.set("session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
