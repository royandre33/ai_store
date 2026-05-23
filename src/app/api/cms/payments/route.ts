import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const methods = await prisma.paymentMethod.findMany({
    orderBy: { order: "asc" },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(methods);
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { label, type, typeLabel, logoSrc, order = 0, steps = [], ...fields } = body;

    if (!label || !type) {
      return NextResponse.json({ error: "Missing required fields: label and type are required" }, { status: 400 });
    }

    // Generate unique id based on slugified label
    const baseId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let id = baseId || "payment";
    
    // Check if id already exists, if so append a suffix
    const exists = await prisma.paymentMethod.findUnique({ where: { id } });
    if (exists) {
      id = `${baseId}-${Date.now().toString().slice(-4)}`;
    }

    // Clean up fields to avoid prisma model validation issues with null/undefined values
    const cleanedFields: Record<string, string | null> = {};
    const allowedFields = [
      "accountHolder",
      "accountNumber",
      "accountType",
      "bankFullName",
      "phoneNumber",
      "accountName",
      "qrisImageSrc",
    ];

    allowedFields.forEach((field) => {
      const val = (fields as Record<string, unknown>)[field];
      if (val !== undefined) {
        cleanedFields[field] = val === "" ? null : (val as string);
      }
    });

    const method = await prisma.paymentMethod.create({
      data: {
        id,
        label,
        type,
        typeLabel: typeLabel || (type === "bank-transfer" ? "Transfer" : type === "e-wallet" ? "E-Wallet" : "Scan QR"),
        logoSrc: logoSrc || "",
        order: Number(order),
        ...cleanedFields,
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
  } catch (error: unknown) {
    console.error("POST /api/cms/payments error:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment method";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


