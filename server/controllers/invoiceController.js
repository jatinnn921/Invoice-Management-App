import { z } from "zod";
import { prisma } from "../config/prisma.js";

const invoiceStatuses = ["PAID", "PENDING", "OVERDUE"];

const lineItemSchema = z
  .object({
    description: z.string().trim().min(1, "Description is required"),
    quantity: z.coerce.number().finite().positive("Quantity must be positive"),
    unitPrice: z.coerce.number().finite().nonnegative("Unit price cannot be negative"),
  })
  .strict();

const invoiceFields = {
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
  clientId: z.string().trim().min(1, "Client ID is required"),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  status: z.enum(invoiceStatuses).optional(),
  taxRate: z.coerce
    .number()
    .finite()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100"),
  notes: z.string().trim().nullable().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
};

const createInvoiceSchema = z
  .object(invoiceFields)
  .strict()
  .refine((value) => value.dueDate >= value.issueDate, {
    message: "Due date cannot be before issue date",
    path: ["dueDate"],
  });

const updateInvoiceSchema = z
  .object({
    invoiceNumber: invoiceFields.invoiceNumber.optional(),
    clientId: invoiceFields.clientId.optional(),
    issueDate: invoiceFields.issueDate.optional(),
    dueDate: invoiceFields.dueDate.optional(),
    status: invoiceFields.status,
    taxRate: invoiceFields.taxRate.optional(),
    notes: invoiceFields.notes,
    lineItems: invoiceFields.lineItems.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  })
  .refine(
    (value) =>
      !value.issueDate ||
      !value.dueDate ||
      value.dueDate >= value.issueDate,
    {
      message: "Due date cannot be before issue date",
      path: ["dueDate"],
    },
  );

function validationError(response, error) {
  response.status(400).json({
    error: "Validation failed",
    details: error.flatten().fieldErrors,
  });
}

function decimalToCents(value) {
  return Math.round(value * 100);
}

function calculateTotals(lineItems, taxRate) {
  const normalizedLineItems = lineItems.map((item) => {
    const quantityCents = decimalToCents(item.quantity);
    const unitPriceCents = decimalToCents(item.unitPrice);
    const totalCents = Math.round((quantityCents * unitPriceCents) / 100);

    return {
      description: item.description,
      quantity: (quantityCents / 100).toFixed(2),
      unitPrice: (unitPriceCents / 100).toFixed(2),
      total: (totalCents / 100).toFixed(2),
      totalCents,
    };
  });

  const subtotalCents = normalizedLineItems.reduce(
    (sum, item) => sum + item.totalCents,
    0,
  );
  const taxRateBasisPoints = decimalToCents(taxRate);
  const taxAmountCents = Math.round(
    (subtotalCents * taxRateBasisPoints) / 10000,
  );

  return {
    lineItems: normalizedLineItems.map(({ totalCents, ...item }) => item),
    subtotal: (subtotalCents / 100).toFixed(2),
    taxRate: (taxRateBasisPoints / 100).toFixed(2),
    taxAmount: (taxAmountCents / 100).toFixed(2),
    total: ((subtotalCents + taxAmountCents) / 100).toFixed(2),
  };
}

function serializeInvoiceData(data) {
  const serialized = { ...data };
  delete serialized.lineItems;
  return serialized;
}

function includeInvoiceRelations() {
  return {
    client: true,
    lineItems: {
      orderBy: { id: "asc" },
    },
  };
}

export async function markPendingInvoicesOverdue(client = prisma) {
  await client.invoice.updateMany({
    where: {
      status: "PENDING",
      dueDate: { lt: new Date() },
    },
    data: { status: "OVERDUE" },
  });
}

function handlePrismaError(error, response, next) {
  if (error?.code === "P2025") {
    response.status(404).json({ error: "Invoice not found" });
    return;
  }

  if (error?.code === "P2002") {
    response.status(409).json({
      error: "An invoice with that invoice number already exists",
    });
    return;
  }

  if (error?.code === "P2003") {
    response.status(400).json({ error: "Referenced client does not exist" });
    return;
  }

  next(error);
}

export async function listInvoices(request, response, next) {
  try {
    await markPendingInvoicesOverdue();

    const search =
      typeof request.query.search === "string"
        ? request.query.search.trim()
        : "";
    const status =
      typeof request.query.status === "string"
        ? request.query.status.toUpperCase()
        : undefined;

    if (status && !invoiceStatuses.includes(status)) {
      response.status(400).json({
        error: "Invalid status",
        allowedStatuses: invoiceStatuses,
      });
      return;
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                {
                  invoiceNumber: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  client: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: includeInvoiceRelations(),
      orderBy: { createdAt: "desc" },
    });

    response.json(invoices);
  } catch (error) {
    next(error);
  }
}

export async function getInvoice(request, response, next) {
  try {
    await markPendingInvoicesOverdue();

    const invoice = await prisma.invoice.findUnique({
      where: { id: request.params.id },
      include: includeInvoiceRelations(),
    });

    if (!invoice) {
      response.status(404).json({ error: "Invoice not found" });
      return;
    }

    response.json(invoice);
  } catch (error) {
    next(error);
  }
}

export async function createInvoice(request, response, next) {
  const parsed = createInvoiceSchema.safeParse(request.body);

  if (!parsed.success) {
    validationError(response, parsed.error);
    return;
  }

  try {
    const { lineItems, ...invoiceFieldsData } = parsed.data;
    const {
      lineItems: normalizedLineItems,
      ...totalsData
    } = calculateTotals(lineItems, invoiceFieldsData.taxRate);
    const status =
      (invoiceFieldsData.status ?? "PENDING") === "PENDING" &&
      invoiceFieldsData.dueDate < new Date()
        ? "OVERDUE"
        : invoiceFieldsData.status ?? "PENDING";

    const invoice = await prisma.invoice.create({
      data: {
        ...serializeInvoiceData(invoiceFieldsData),
        status,
        ...totalsData,
        lineItems: {
          create: normalizedLineItems,
        },
      },
      include: includeInvoiceRelations(),
    });

    response.status(201).json(invoice);
  } catch (error) {
    handlePrismaError(error, response, next);
  }
}

export async function updateInvoice(request, response, next) {
  const parsed = updateInvoiceSchema.safeParse(request.body);

  if (!parsed.success) {
    validationError(response, parsed.error);
    return;
  }

  try {
    const invoice = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.invoice.findUnique({
        where: { id: request.params.id },
        include: { lineItems: true },
      });

      if (!existing) {
        const error = new Error("Invoice not found");
        error.code = "P2025";
        throw error;
      }

      const nextLineItems = parsed.data.lineItems ?? existing.lineItems;
      const nextTaxRate = parsed.data.taxRate ?? Number(existing.taxRate);
      const nextDueDate = parsed.data.dueDate ?? existing.dueDate;
      const nextStatus = parsed.data.status ?? existing.status;
      const status =
        nextStatus === "PENDING" && nextDueDate < new Date()
          ? "OVERDUE"
          : nextStatus;
      const {
        lineItems: normalizedLineItems,
        ...totalsData
      } = calculateTotals(
        nextLineItems.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
        nextTaxRate,
      );
      const { lineItems, ...invoiceFieldsData } = parsed.data;

      if (lineItems) {
        await transaction.lineItem.deleteMany({
          where: { invoiceId: request.params.id },
        });
      }

      return transaction.invoice.update({
        where: { id: request.params.id },
        data: {
          ...serializeInvoiceData(invoiceFieldsData),
          status,
          ...totalsData,
          ...(lineItems
            ? {
                lineItems: {
                  create: normalizedLineItems,
                },
              }
            : {}),
        },
        include: includeInvoiceRelations(),
      });
    });

    response.json(invoice);
  } catch (error) {
    handlePrismaError(error, response, next);
  }
}

export async function deleteInvoice(request, response, next) {
  try {
    await prisma.invoice.delete({
      where: { id: request.params.id },
    });

    response.status(204).send();
  } catch (error) {
    handlePrismaError(error, response, next);
  }
}