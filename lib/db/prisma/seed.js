import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const clients = [
  {
    id: "seed-client-001",
    name: "Maya Chen",
    email: "maya@northstar.studio",
    phone: "+1 415 555 0142",
    address: "88 Valencia Street, San Francisco, CA 94110",
  },
  {
    id: "seed-client-002",
    name: "Priya Shah",
    email: "priya@commonthread.org",
    phone: "+1 212 555 0188",
    address: "240 Lafayette Street, New York, NY 10012",
  },
  {
    id: "seed-client-003",
    name: "Oliver Grant",
    email: "oliver@fieldwork.co",
    phone: "+44 20 7946 0312",
    address: "14 Clerkenwell Road, London EC1M 5PQ",
  },
  {
    id: "seed-client-004",
    name: "Elena Rossi",
    email: "elena@solace.world",
    phone: "+39 02 555 0167",
    address: "Via Tortona 31, 20144 Milan, Italy",
  },
  {
    id: "seed-client-005",
    name: "Theo Martins",
    email: "theo@marrow.design",
    phone: "+1 647 555 0129",
    address: "310 King Street West, Toronto, ON M5V 1J5",
  },
];

const invoiceDefinitions = [
  {
    invoiceNumber: "INV-2026-1001",
    clientId: "seed-client-001",
    issueDate: "2026-01-08",
    dueDate: "2026-01-22",
    status: "PAID",
    taxRate: 8.5,
    notes: "Thank you for partnering with us on the Northstar launch.",
    lineItems: [
      { description: "Brand strategy workshop", quantity: 2, unitPrice: 900 },
      { description: "Launch messaging system", quantity: 1, unitPrice: 1200 },
    ],
  },
  {
    invoiceNumber: "INV-2026-1002",
    clientId: "seed-client-002",
    issueDate: "2026-02-03",
    dueDate: "2026-02-17",
    status: "PAID",
    taxRate: 8.5,
    notes: "Project complete. Retainer hours rolled forward as agreed.",
    lineItems: [
      { description: "Research and discovery", quantity: 1, unitPrice: 1450 },
      { description: "Service blueprint", quantity: 1, unitPrice: 1850 },
    ],
  },
  {
    invoiceNumber: "INV-2026-1003",
    clientId: "seed-client-004",
    issueDate: "2026-03-11",
    dueDate: "2026-03-25",
    status: "PAID",
    taxRate: 8.5,
    notes: "Paid by bank transfer on March 20.",
    lineItems: [
      { description: "Product photography direction", quantity: 1, unitPrice: 1100 },
      { description: "Campaign art direction", quantity: 2, unitPrice: 850 },
    ],
  },
  {
    invoiceNumber: "INV-2026-1004",
    clientId: "seed-client-003",
    issueDate: "2026-08-01",
    dueDate: "2026-09-01",
    status: "PENDING",
    taxRate: 8.5,
    notes: "Please include the invoice number with your payment.",
    lineItems: [
      { description: "Website content audit", quantity: 1, unitPrice: 1250 },
      { description: "Editorial recommendations", quantity: 3, unitPrice: 375 },
    ],
  },
  {
    invoiceNumber: "INV-2026-1005",
    clientId: "seed-client-005",
    issueDate: "2026-08-15",
    dueDate: "2026-09-15",
    status: "PENDING",
    taxRate: 8.5,
    notes: "Includes the first milestone of the Marrow identity refresh.",
    lineItems: [
      { description: "Identity design milestone", quantity: 1, unitPrice: 2400 },
      { description: "Presentation template", quantity: 1, unitPrice: 800 },
    ],
  },
  {
    invoiceNumber: "INV-2026-1006",
    clientId: "seed-client-001",
    issueDate: "2026-07-01",
    dueDate: "2026-07-15",
    status: "OVERDUE",
    taxRate: 8.5,
    notes: "Payment reminder sent on August 1.",
    lineItems: [
      { description: "Design system production support", quantity: 8, unitPrice: 175 },
      { description: "Component documentation", quantity: 1, unitPrice: 700 },
    ],
  },
  {
    invoiceNumber: "INV-2026-1007",
    clientId: "seed-client-003",
    issueDate: "2026-06-12",
    dueDate: "2026-06-26",
    status: "OVERDUE",
    taxRate: 8.5,
    notes: "Awaiting approval from the finance team.",
    lineItems: [
      { description: "Content migration", quantity: 12, unitPrice: 160 },
      { description: "CMS training session", quantity: 2, unitPrice: 450 },
    ],
  },
  {
    invoiceNumber: "INV-2026-1008",
    clientId: "seed-client-002",
    issueDate: "2026-05-05",
    dueDate: "2026-05-19",
    status: "OVERDUE",
    taxRate: 8.5,
    notes: "Second reminder sent on June 10.",
    lineItems: [
      { description: "Customer journey mapping", quantity: 1, unitPrice: 1600 },
      { description: "Stakeholder readout", quantity: 1, unitPrice: 600 },
    ],
  },
  {
    invoiceNumber: "INV-2026-1009",
    clientId: "seed-client-005",
    issueDate: "2026-08-20",
    dueDate: "2026-09-20",
    status: "PENDING",
    taxRate: 8.5,
    notes: "Final payment due after delivery of the brand toolkit.",
    lineItems: [
      { description: "Brand toolkit production", quantity: 1, unitPrice: 1750 },
      { description: "Handoff and team workshop", quantity: 1, unitPrice: 550 },
    ],
  },
];

function toCents(value) {
  return Math.round(value * 100);
}

function calculateInvoiceAmounts(lineItems, taxRate) {
  const normalizedItems = lineItems.map((item) => {
    const quantityCents = toCents(item.quantity);
    const unitPriceCents = toCents(item.unitPrice);
    const totalCents = Math.round((quantityCents * unitPriceCents) / 100);

    return {
      description: item.description,
      quantity: (quantityCents / 100).toFixed(2),
      unitPrice: (unitPriceCents / 100).toFixed(2),
      total: (totalCents / 100).toFixed(2),
      totalCents,
    };
  });

  const subtotalCents = normalizedItems.reduce(
    (sum, item) => sum + item.totalCents,
    0,
  );
  const taxRateBasisPoints = toCents(taxRate);
  const taxAmountCents = Math.round(
    (subtotalCents * taxRateBasisPoints) / 10000,
  );

  return {
    lineItems: normalizedItems.map(({ totalCents, ...item }) => item),
    subtotal: (subtotalCents / 100).toFixed(2),
    taxRate: (taxRateBasisPoints / 100).toFixed(2),
    taxAmount: (taxAmountCents / 100).toFixed(2),
    total: ((subtotalCents + taxAmountCents) / 100).toFixed(2),
  };
}

async function main() {
  for (const client of clients) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: client,
      create: client,
    });
  }

  for (const definition of invoiceDefinitions) {
    const amounts = calculateInvoiceAmounts(
      definition.lineItems,
      definition.taxRate,
    );

    await prisma.invoice.upsert({
      where: { invoiceNumber: definition.invoiceNumber },
      update: {
        clientId: definition.clientId,
        issueDate: new Date(definition.issueDate),
        dueDate: new Date(definition.dueDate),
        status: definition.status,
        subtotal: amounts.subtotal,
        taxRate: amounts.taxRate,
        taxAmount: amounts.taxAmount,
        total: amounts.total,
        notes: definition.notes,
        lineItems: {
          deleteMany: {},
          create: amounts.lineItems,
        },
      },
      create: {
        invoiceNumber: definition.invoiceNumber,
        clientId: definition.clientId,
        issueDate: new Date(definition.issueDate),
        dueDate: new Date(definition.dueDate),
        status: definition.status,
        subtotal: amounts.subtotal,
        taxRate: amounts.taxRate,
        taxAmount: amounts.taxAmount,
        total: amounts.total,
        notes: definition.notes,
        lineItems: {
          create: amounts.lineItems,
        },
      },
    });
  }

  const [clientCount, invoiceCount, lineItemCount] = await Promise.all([
    prisma.client.count(),
    prisma.invoice.count(),
    prisma.lineItem.count(),
  ]);

  const statusCounts = await prisma.invoice.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  process.stdout.write(
    `Seed complete: ${clientCount} clients, ${invoiceCount} invoices, ${lineItemCount} line items\n`,
  );
  process.stdout.write(
    `Invoice statuses: ${statusCounts
      .sort((a, b) => a.status.localeCompare(b.status))
      .map((group) => `${group.status}=${group._count._all}`)
      .join(", ")}\n`,
  );
}

main()
  .catch((error) => {
    process.stderr.write(`Seed failed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });