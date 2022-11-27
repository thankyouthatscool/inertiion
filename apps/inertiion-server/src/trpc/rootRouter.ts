import { itemRouter } from "./routes";
import { router } from ".";

export const appRouter = router({ item: itemRouter });

export type AppRouter = typeof appRouter;
