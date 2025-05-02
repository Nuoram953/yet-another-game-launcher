import { MEDIA_TYPE } from "src/common/constant";
import { prisma } from "..";

export async function findByName(name:MEDIA_TYPE) {
  return await prisma.mediaType.findFirst({
    where:{
      name
    }
  });
}
