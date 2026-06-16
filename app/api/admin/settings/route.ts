import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const TICKET_PRICE_KEY = "ticketPrice";

export async function GET() {
  try {
    const row = await prisma.settings.findUnique({ where: { key: TICKET_PRICE_KEY } });
    const ticketPrice = row ? parseFloat(row.value) : 0;
    return NextResponse.json({ ticketPrice });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar configurações." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { ticketPrice } = await request.json();
    if (typeof ticketPrice !== "number" || ticketPrice < 0) {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }

    await prisma.settings.upsert({
      where: { key: TICKET_PRICE_KEY },
      update: { value: String(ticketPrice) },
      create: { key: TICKET_PRICE_KEY, value: String(ticketPrice) },
    });

    return NextResponse.json({ ticketPrice });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar configurações." }, { status: 500 });
  }
}
