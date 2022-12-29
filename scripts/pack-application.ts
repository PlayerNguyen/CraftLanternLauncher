import packager from "electron-packager";
import fs from "fs";
const OUTPUT_DIRECTORY: string = process.env.OUTPUT_DIRECTORY || "build";

(async () => {
  // Make a directory if not found
  if (!fs.existsSync(OUTPUT_DIRECTORY)) {
    fs.mkdirSync(OUTPUT_DIRECTORY);
  }

  const appPaths = await packager({
    dir: ".",
    ignore: [],
    out: OUTPUT_DIRECTORY,
    overwrite: true,
  });

  console.log(`Successfully packed app: `);

  appPaths.forEach((e) => {
    console.log(` • ${e}`);
  });
})().catch(console.error);
