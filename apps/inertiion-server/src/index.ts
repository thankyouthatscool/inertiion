import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { once } from "events";
import fs from "fs";
import path from "path";
import readline from "readline";

config();

let items: string[] = [];

const prisma = new PrismaClient();

const filterOutLine = (line: string) => {
  const formattedLine = line
    .split(",")
    .map((chunk) => chunk.trim())
    .filter((chunk) => !!chunk)
    .join(", ");

  if (formattedLine.length > 1) {
    if (/^[A-Z]+[0-9\-]+/i.test(formattedLine)) {
      items.push(formattedLine);
    }
  }
};

const formatItemLines = (lineArray: string[]) => {
  const lineArrayMap = lineArray.map((line) => {
    const [item, location] = line.split(",");
    const [code, ...description] = item.trim().split(" ");
    const [loc] = location.trim().split(" ");

    return { code, description: description.join(" ").trim(), location: loc };
  });

  return lineArrayMap;
};

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(__dirname, "./data/new_loc.csv")),
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    filterOutLine(line);
  });

  await once(rl, "close");

  const jsonItems = formatItemLines(items);

  // try {
  //   await prisma.item.createMany({
  //     data: jsonItems.map(({ code, description, location }) => {
  //       return { code, description, location };
  //     }),
  //   });
  // } catch (e) {
  //   console.log(e);
  // }

  // fs.writeFileSync(
  //   path.join(__dirname, "./data/new_loc.json"),
  //   JSON.stringify(jsonItems)
  // );
})();
