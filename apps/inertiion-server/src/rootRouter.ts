import { itemRouter } from "./router";
import { router } from "./trpc";

export const appRouter = router({ item: itemRouter });

export type AppRouter = typeof appRouter;
