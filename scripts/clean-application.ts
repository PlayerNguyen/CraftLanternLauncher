import fs from "fs";

const CLEAN_DIRECTORIES_LIST = ["dist", "build", ".parcel-cache"];

(async () => {
  CLEAN_DIRECTORIES_LIST.forEach((item) => {
    fs.rmSync(item, { recursive: true, force: true });
  });
})().catch(console.error);
