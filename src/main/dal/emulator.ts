import { prisma } from "..";

export const findAll = async () => {
  return await prisma.emulator.findMany();
};

export const getById = async (emulatorId: number) => {
  return await prisma.emulator.findUnique({ where: { id: emulatorId } });
};
