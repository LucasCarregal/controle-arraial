import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(registrations);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar cadastros." }, { status: 500 });
  }
}

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
        addedByAdmin: true,
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar cadastro." }, { status: 500 });
  }
}
