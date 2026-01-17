import { Franchise } from "@prisma/client";
import { prisma } from "..";

export async function findOrCreate(name: string): Promise<Franchise> {
  return await prisma.franchise.upsert({
    where: {
      name,
    },
    update: {},
    create: {
      name: name,
    },
  });
}

export async function findAll(): Promise<Franchise[]> {
  return await prisma.franchise.findMany();
}
