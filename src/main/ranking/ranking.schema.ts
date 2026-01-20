import * as z from "zod";

export const CreateRankingSchema = z.object({
  name: z.string(),
  description: z.string(),
});
export type CreateRankingSchema = z.infer<typeof CreateRankingSchema>;

export const GetRankingSchema = z.number();
export type GetRankingSchema = z.infer<typeof GetRankingSchema>;

export const DeleteRankingSchema = z.number();
export type DeleteRankingSchema = z.infer<typeof DeleteRankingSchema>;

export const AddGameRankingSchema = z.object({
  rankingId: z.number(),
  gameId: z.string(),
});
export type AddGameRankingSchema = z.infer<typeof AddGameRankingSchema>;

export const RemoveGameRankingSchema = z.object({
  rankingId: z.number(),
  gameId: z.string(),
});
export type RemoveGameRankingSchema = z.infer<typeof RemoveGameRankingSchema>;

export const UpdateGameOrderSchema = z.object({
  rankingId: z.number(),
  gameOrders: z.array(
    z.object({
      gameId: z.string(),
      rank: z.number(),
    }),
  ),
});
export type UpdateGameOrderSchema = z.infer<typeof UpdateGameOrderSchema>;
