import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getWebPush } from "@/lib/webpush";

export const dynamic = "force-dynamic";

// GET - list all requests (for admin)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status && status !== "all" ? { status } : {};

  const requests = await db().gameRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

// POST - create new request (from user)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameName, reason, userName } = body;

    if (!gameName || gameName.trim().length === 0) {
      return NextResponse.json({ error: "Nama game wajib diisi" }, { status: 400 });
    }

    if (gameName.length > 100) {
      return NextResponse.json({ error: "Nama game terlalu panjang" }, { status: 400 });
    }

    const gameRequest = await db().gameRequest.create({
      data: {
        gameName: gameName.trim(),
        reason: reason?.trim() || null,
        userName: userName?.trim() || null,
      },
    });

    // Send push notification to all admin subscribers
    try {
      const webpush = getWebPush();
      const adminSubs = await db().pushSubscription.findMany({
        where: { isAdmin: true },
      });

      const payload = JSON.stringify({
        title: "🎮 Request Game Baru!",
        body: `${userName || "Anonymous"} request: ${gameName}`,
        url: "/admin",
        tag: "game-request",
      });

      await Promise.allSettled(
        adminSubs.map((sub) =>
          webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          ).catch(async (err: { statusCode?: number }) => {
            if (err.statusCode === 404 || err.statusCode === 410) {
              await db().pushSubscription.delete({ where: { id: sub.id } });
            }
          })
        )
      );
    } catch (pushError) {
      console.error("Push notification error:", pushError);
    }

    return NextResponse.json(gameRequest, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Gagal membuat request" }, { status: 500 });
  }
}
