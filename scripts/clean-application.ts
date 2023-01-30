import { rmNonEmptyDir } from "../src/electron/FileSystem";


const CLEAN_DIRECTORIES_LIST = ["dist", "build", ".parcel-cache"];

(async () => {
  CLEAN_DIRECTORIES_LIST.forEach((item) => {
    rmNonEmptyDir(item);
  });
})().catch(console.error);
