import { FilterPreset } from "@prisma/client";
import { prisma } from "..";
import _ from "lodash";

export const findAll = async () => {
  return await prisma.filterPreset.findMany();
};

export const createOrUpdate = async (data: Partial<FilterPreset>) => {
  return await prisma.filterPreset.upsert({
    where: {
      name: data.name,
    },
    update: {
      config: data.config,
    },
    create: {
      name: data.name,
      config: data.config,
    },
  });
};

export const deleteById = async (id: number) => {
  return await prisma.filterPreset.delete({
    where: {
      id: id,
    },
  });
};

export const deleteByName = async (name: string) => {
  return await prisma.filterPreset.delete({
    where: {
      name,
    },
  });
};
