import { Company } from "@prisma/client";
import { prisma } from "..";

export async function findOrCreate(name: string):Promise<Company> {
  return await prisma.company.upsert({
    where: {
      name,
    },
    update: {},
    create: {
      name: name,
    },
  });
}
