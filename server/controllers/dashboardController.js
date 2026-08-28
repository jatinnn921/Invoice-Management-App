import { prisma } from "../config/prisma.js";
import { markPendingInvoicesOverdue } from "./invoiceController.js";

function formatAmount(value) {
  return value ? value.toFixed(2) : "0.00";
}

export async function getDashboardStats(_request, response, next) {
  try {
    await markPendingInvoicesOverdue();

    const groupedInvoices = await prisma.invoice.groupBy({
      by: ["status"],
      _sum: {
        total: true,
      },
      _count: {
        _all: true,
      },
    });

    const stats = {
      totalCollected: "0.00",
      totalAwaitingPayment: "0.00",
      totalOverdueAmount: "0.00",
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
    };

    for (const group of groupedInvoices) {
      const total = formatAmount(group._sum.total);
      const count = group._count._all;

      if (group.status === "PAID") {
        stats.totalCollected = total;
        stats.paidCount = count;
      } else if (group.status === "PENDING") {
        stats.totalAwaitingPayment = total;
        stats.pendingCount = count;
      } else if (group.status === "OVERDUE") {
        stats.totalOverdueAmount = total;
        stats.overdueCount = count;
      }
    }

    response.json(stats);
  } catch (error) {
    next(error);
  }
}