import * as trpcExpress from "@trpc/server/adapters/express";
import axios, { AxiosError } from "axios";
import { config } from "dotenv";
import express from "express";
import { exit } from "process";

import { prisma } from "./db";
import { createContext } from "./trpc";
import { appRouter } from "./trpc/rootRouter";
import { updateAppApiUrl } from "./utils";

export * from "./trpc/rootRouter";

config();

const NODE_ENV = process.env.NODE_ENV;

const app = express();

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({ router: appRouter, createContext })
);

app.get("/download", async (_, res) => {
  try {
    const catalogData = await prisma.item.findMany();

    return res.status(200).json(JSON.stringify({ data: catalogData }));
  } catch (err) {
    return res.status(500).json(JSON.stringify({ data: [] }));
  }
});

const startServer = () => {
  const PORT = process.env.SERVER_PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}...`);
  });
};

const main = async () => {
  if (NODE_ENV === "development") {
    try {
      const res = await axios.get("http://127.0.0.1:4040/api/tunnels");

      const tunnelData = res.data.tunnels[0].public_url;

      updateAppApiUrl(tunnelData);

      startServer();
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error(err.message);
      } else {
        console.log(err);

        console.log("Something else went completely wrong.");

        exit(1);
      }

      console.log("Either something went wrong, or the tunnel is not running.");

      exit(1);
    }
  } else if (NODE_ENV === "prod") {
    console.log("running in prod");
  } else {
    console.log(
      "This is something else entirely, and someone else will handle this."
    );

    exit(1);
  }
};

main();
