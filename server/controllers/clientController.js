import { z } from "zod";
import { prisma } from "../config/prisma.js";

const clientFields = {
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("A valid email is required"),
  phone: z.string().trim().nullable().optional(),
  address: z.string().trim().nullable().optional(),
};

const createClientSchema = z.object(clientFields).strict();
const updateClientSchema = z
  .object(clientFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

function validationError(response, error) {
  response.status(400).json({
    error: "Validation failed",
    details: error.flatten().fieldErrors,
  });
}

function handlePrismaError(error, response, next) {
  if (error?.code === "P2025") {
    response.status(404).json({ error: "Client not found" });
    return;
  }

  if (error?.code === "P2003") {
    response.status(409).json({
      error: "Client cannot be deleted while it has invoices",
    });
    return;
  }

  next(error);
}

export async function listClients(_request, response, next) {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });

    response.json(clients);
  } catch (error) {
    next(error);
  }
}

export async function createClient(request, response, next) {
  const parsed = createClientSchema.safeParse(request.body);

  if (!parsed.success) {
    validationError(response, parsed.error);
    return;
  }

  try {
    const client = await prisma.client.create({
      data: parsed.data,
    });

    response.status(201).json(client);
  } catch (error) {
    next(error);
  }
}

export async function updateClient(request, response, next) {
  const parsed = updateClientSchema.safeParse(request.body);

  if (!parsed.success) {
    validationError(response, parsed.error);
    return;
  }

  try {
    const client = await prisma.client.update({
      where: { id: request.params.id },
      data: parsed.data,
    });

    response.json(client);
  } catch (error) {
    handlePrismaError(error, response, next);
  }
}

export async function deleteClient(request, response, next) {
  try {
    await prisma.client.delete({
      where: { id: request.params.id },
    });

    response.status(204).send();
  } catch (error) {
    handlePrismaError(error, response, next);
  }
}