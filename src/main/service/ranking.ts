import queries from "../dal/dal";

export const getAll = async () => {
  return await queries.Ranking.findAll();
};

export const create = async (name:string, maxItems:number) => {
  const ranking = await queries.Ranking.insert(name, maxItems);
  if (!ranking) {
    throw new Error("Error creating ranking");
  }
  return await queries.Ranking.findById(ranking.id);
};

export const destroy = async (id:number) => {
  const ranking = await queries.Ranking.destroy(id);
  if (!ranking) {
    throw new Error("Error creating ranking");
  }
};
