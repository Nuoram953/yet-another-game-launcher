import { prisma } from "..";

export const findAll = async () => {
  return await prisma.emulator.findMany();
};
