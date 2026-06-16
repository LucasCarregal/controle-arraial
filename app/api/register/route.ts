import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contact, invitedBy } = body;

    if (!name?.trim() || !contact?.trim() || !invitedBy?.trim()) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        name: name.trim(),
        contact: contact.trim(),
        invitedBy: invitedBy.trim(),
      },
    });

    return NextResponse.json({ success: true, id: registration.id }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[register] DB error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
