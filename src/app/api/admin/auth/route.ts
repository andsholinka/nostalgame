import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST - verify admin password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
