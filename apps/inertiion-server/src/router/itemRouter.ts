import { z } from "zod";

import { prisma } from "../db";
import { publicProcedure, router } from "../trpc";

const getAllItems = publicProcedure
  .input(z.string().nullable())
  .query(async () => {
    try {
      const res = await prisma.item.findMany();

      return { code: 200, data: res, message: "Items fetched successfully." };
    } catch (e) {
      return { code: 500, data: [], message: "Could not fetch items." };
    }
  });

export const tester = publicProcedure.input(z.string().nullable()).query(() => {
  return { code: 200 };
});

export const itemRouter = router({
  getAllItems,
  tester,
});
