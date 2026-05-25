import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: [
      { sold: "desc" },
      { order: "asc" },
    ],
    include: {
      thumbnails: { orderBy: { order: "asc" } },
      variants: { orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { thumbnails = [], variants = [], ...fields } = body;

  const count = await prisma.product.count();
  const product = await prisma.product.create({
    data: {
      ...fields,
      order: count,
      thumbnails: {
        create: (thumbnails as string[]).map((url: string, i: number) => ({
          url,
          order: i,
        })),
      },
      variants: {
        create: variants.map(
          (v: { label: string; price: number }, i: number) => ({
            ...v,
            order: i,
          })
        ),
      },
    },
    include: {
      thumbnails: { orderBy: { order: "asc" } },
      variants: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(product, { status: 201 });
}
