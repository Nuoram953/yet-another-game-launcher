import { Company } from "@prisma/client";
import { prisma } from "..";

export async function findOrCreate(data: Partial<Company>): Promise<Company> {
  const name = data.name!;
  return await prisma.company.upsert({
    where: {
      name,
    },
    update: {
      name: data.name,
      description: data.description,
      country: data.country,
      startedAt: data.startedAt,
      url: data.url,
    },
    create: {
      name: data.name!,
      description: data.description,
      country: data.country,
      startedAt: data.startedAt,
      url: data.url,
    },
  });
}
