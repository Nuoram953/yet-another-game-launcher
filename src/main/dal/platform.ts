import { Platform } from "@prisma/client";
import { prisma } from "..";

export async function findOrCreate(name: string): Promise<Platform> {
  return await prisma.platform.upsert({
    where: {
      name,
    },
    update: {},
    create: {
      name: name,
    },
  });
}

export async function findAll(): Promise<Platform[]> {
  return await prisma.platform.findMany();
}
