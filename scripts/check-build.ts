import fs from "fs";
const DIST_DIRECTORY_NAME: string = process.env.DIST_DIRECTORY_NAME || "./dist";

(async () => {
  if (!fs.existsSync(DIST_DIRECTORY_NAME)) {
    throw new Error(
      `"${DIST_DIRECTORY_NAME}" not found, please build the application first.`
    );
  }
})();
