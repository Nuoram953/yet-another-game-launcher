import { prisma } from "..";

export async function getAll() {
  return await prisma.storefront.findMany();
}
