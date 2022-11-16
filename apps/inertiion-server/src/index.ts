import * as trpcExpress from "@trpc/server/adapters/express";
import axios, { AxiosError } from "axios";
import { config } from "dotenv";
import express from "express";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { exit } from "process";

import { appRouter } from "./rootRouter";
import { createContext } from "./trpc";

export * from "./rootRouter";

config();

const app = express();

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({ router: appRouter, createContext })
);

const startServer = () => {
  const PORT = process.env.SERVER_PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}...`);
  });
};

const updateAppApiUrl = (apiUrl: string) => {
  const appDirectory = resolve(__dirname, "../../inertiion-app");

  writeFileSync(resolve(appDirectory, "api.json"), JSON.stringify({ apiUrl }));
};

(async () => {
  const NODE_ENV = process.env.NODE_ENV;

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
})();
