import type { AppRouter } from "@inertiion/inertiion-server";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
