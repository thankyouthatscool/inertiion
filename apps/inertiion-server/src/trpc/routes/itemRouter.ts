import { readFileSync } from "fs";
import { resolve } from "path";
import { z } from "zod";

import { prisma } from "../../db";
import { publicProcedure, router } from "..";

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

interface Item {
  code: string;
  description?: string;
  location: string;
  moreDescription?: string;
}

export const seedDatabase = publicProcedure
  .input(z.string().optional())
  .query(async () => {
    const dataFileLocation = resolve(__dirname, "../../data/new_loc.json");
    const fileContent = readFileSync(dataFileLocation);
    const catalogData: Item[] = JSON.parse(fileContent.toString());

    try {
      await prisma.item.createMany({ data: catalogData });

      return { code: 200 };
    } catch (err) {
      console.log(err);

      return { code: 500 };
    }
  });

export const itemRouter = router({
  getAllItems,
  seedDatabase,
  tester,
});
