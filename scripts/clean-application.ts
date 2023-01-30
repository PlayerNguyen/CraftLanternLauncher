import rimraf from "rimraf";

const CLEAN_DIRECTORIES_LIST = ["dist", "build", ".parcel-cache"];

(async () => {
  CLEAN_DIRECTORIES_LIST.forEach((item) => {
    rimraf.sync(item);
  });
})().catch(console.error);
