import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH - update request status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["pending", "approved", "rejected", "done"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await db().gameRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json({ error: "Gagal update request" }, { status: 500 });
  }
}

// DELETE - delete request (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db().gameRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete request error:", error);
    return NextResponse.json({ error: "Gagal hapus request" }, { status: 500 });
  }
}
