import { once } from "events";
import { createReadStream, fstat, writeFileSync } from "fs";
import { resolve } from "path";
import readline from "readline";

export const updateAppApiUrl = (apiUrl: string) => {
  const appDirectory = resolve(__dirname, "../../../inertiion-app");

  writeFileSync(resolve(appDirectory, "api.json"), JSON.stringify({ apiUrl }));
  writeFileSync(resolve(appDirectory, ".api.env"), `apiUrl = ${apiUrl}`);
};

export const parseDataFile = async () => {
  const dataFileLocation = resolve(__dirname, "../data/new_loc.csv");

  const rl = readline.createInterface({
    input: createReadStream(dataFileLocation),
    crlfDelay: Infinity,
  });

  let catalogItems: string[] = [];

  rl.on("line", (line) => {
    if (/^[A-Za-z]{1,4}-?\d{1,4}/i.test(line.trim())) {
      catalogItems.push(line.trim());
    }
  });

  await once(rl, "close");

  const parsedLocations = catalogItems.map((item) => parseLine(item));

  const outputLocation = resolve(__dirname, "../data/new_loc.json");

  writeFileSync(outputLocation, JSON.stringify(parsedLocations));
};

const parseLine = (line: string) => {
  const [item, location] = line.split(",");
  const [code, ...description] = item.split(" ");
  const [loc, ...moreDescription] = location.trim().split(" ");

  return {
    code,
    description: description.join(" ").trim(),
    location: loc,
    moreDescription: moreDescription.join(" ").trim(),
  };
};
