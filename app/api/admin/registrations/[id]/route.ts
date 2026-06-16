import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const existing = await prisma.registration.findUnique({ where: { id: numId } });
    if (!existing) {
      return NextResponse.json({ error: "Cadastro não encontrado." }, { status: 404 });
    }

    let data: { paymentConfirmed: boolean; amountPaid: number | null };

    if (existing.paymentConfirmed) {
      // Desfazer pagamento
      data = { paymentConfirmed: false, amountPaid: null };
    } else {
      // Confirmar pagamento — requer amountPaid no body
      const body = await request.json().catch(() => ({}));
      const amountPaid = typeof body.amountPaid === "number" ? body.amountPaid : null;
      data = { paymentConfirmed: true, amountPaid };
    }

    const updated = await prisma.registration.update({ where: { id: numId }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar." }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const { name, contact, invitedBy } = await request.json();
    if (!name?.trim() || !contact?.trim() || !invitedBy?.trim()) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    const updated = await prisma.registration.update({
      where: { id: numId },
      data: { name: name.trim(), contact: contact.trim(), invitedBy: invitedBy.trim() },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao editar." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    await prisma.registration.delete({ where: { id: numId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao remover." }, { status: 500 });
  }
}
