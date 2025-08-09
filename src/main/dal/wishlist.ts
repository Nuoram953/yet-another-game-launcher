import { prisma } from "..";

export async function findAll() {
  return await prisma.wishlist.findMany();
}

export async function create(externalId: number) {
  return await prisma.wishlist.create({ data: { externalId } });
}

export async function deleteByExternalId(externalId: number) {
  return await prisma.wishlist.delete({ where: { externalId } });
}
