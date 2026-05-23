import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { steps = [], ...fields } = body;

  await prisma.paymentStep.deleteMany({ where: { paymentMethodId: id } });

  const method = await prisma.paymentMethod.update({
    where: { id },
    data: {
      ...fields,
      steps: {
        create: (steps as string[]).map((text: string, i: number) => ({
          text,
          order: i,
        })),
      },
    },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(method);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    await prisma.paymentStep.deleteMany({ where: { paymentMethodId: id } });

    await prisma.paymentMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/cms/payments/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete payment method";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

