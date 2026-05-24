"use server";

import { prisma } from "@/lib/prisma";

export async function getAnalytics(range: "today" | "week" | "month" | "year" | "all" = "all") {
  const now = new Date();
  let startDate: Date | undefined;

  if (range === "today") {
    // Start of today in WIB (UTC+7)
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    wibNow.setUTCHours(0, 0, 0, 0);
    startDate = new Date(wibNow.getTime() - 7 * 60 * 60 * 1000);
  } else if (range === "week") {
    // Start of week (Monday) in WIB
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const day = wibNow.getUTCDay();
    const diff = wibNow.getUTCDate() - day + (day === 0 ? -6 : 1);
    wibNow.setUTCDate(diff);
    wibNow.setUTCHours(0, 0, 0, 0);
    startDate = new Date(wibNow.getTime() - 7 * 60 * 60 * 1000);
  } else if (range === "month") {
    // Start of month in WIB
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    wibNow.setUTCDate(1);
    wibNow.setUTCHours(0, 0, 0, 0);
    startDate = new Date(wibNow.getTime() - 7 * 60 * 60 * 1000);
  } else if (range === "year") {
    // Start of year in WIB
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    wibNow.setUTCMonth(0);
    wibNow.setUTCDate(1);
    wibNow.setUTCHours(0, 0, 0, 0);
    startDate = new Date(wibNow.getTime() - 7 * 60 * 60 * 1000);
  }

  const dateFilter = startDate ? { gte: startDate } : undefined;

  const [totalOrders, totalRevenueData, orderItems] = await Promise.all([
    // Total pesanan (tidak termasuk yang CANCELLED dan difilter tanggal)
    prisma.order.count({
      where: {
        status: {
          not: "CANCELLED",
        },
        createdAt: dateFilter,
      },
    }),

    // Total pendapatan (sum of totalAmount)
    prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: {
          not: "CANCELLED",
        },
        createdAt: dateFilter,
      },
    }),

    // Dapatkan semua order items untuk menghitung produk terlaris
    prisma.orderItem.findMany({
      where: dateFilter ? {
        order: {
          createdAt: dateFilter,
        },
      } : undefined,
      include: {
        order: true,
      },
    }),
  ]);

  const totalRevenue = totalRevenueData._sum.totalAmount || 0;

  // Hitung frekuensi produk terlaris
  // Kita group by productName dan variantLabel
  const productSales: Record<
    string,
    { name: string; variant: string; count: number; revenue: number }
  > = {};

  orderItems.forEach((item) => {
    // Abaikan pesanan yang dibatalkan
    if (item.order.status === "CANCELLED") return;

    const key = `${item.productName}-${item.variantLabel}`;
    if (!productSales[key]) {
      productSales[key] = {
        name: item.productName,
        variant: item.variantLabel,
        count: 0,
        revenue: 0,
      };
    }

    productSales[key].count += item.quantity;
    productSales[key].revenue += item.price * item.quantity;
  });

  // Urutkan dari yang terbanyak
  const bestSellingProducts = Object.values(productSales).sort(
    (a, b) => b.count - a.count,
  );

  return {
    totalOrders,
    totalRevenue,
    bestSellingProducts: bestSellingProducts.slice(0, 5), // Top 5
  };
}
