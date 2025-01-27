import { Tag } from "@prisma/client";
import { prisma } from "..";

export async function findOrCreate(name: string):Promise<Tag> {
  return await prisma.tag.upsert({
    where: {
      name,
    },
    update: {},
    create: {
      name: name,
    },
  });
}
