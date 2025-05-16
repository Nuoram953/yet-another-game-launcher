import { prisma } from "..";

export async function findAll() {
  return await prisma.storefront.findMany();
}
