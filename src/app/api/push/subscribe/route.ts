import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST - subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, isAdmin, adminPassword } = body;

    if (isAdmin) {
      if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Password salah" }, { status: 401 });
      }
    }

    const { endpoint, keys } = subscription;

    await db().pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        isAdmin: isAdmin || false,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        isAdmin: isAdmin || false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Gagal subscribe" }, { status: 500 });
  }
}
