import { Parcel } from "@parcel/core";
import chalk from "chalk";

let bundler = new Parcel({
  entries: "./render/index.html",
  defaultConfig: "@parcel/config-default",
  mode: "production",

  targets: {
    reactRender: {
      distDir: "./dist/render",
      publicUrl: "./",
    },
  },
});

(async () => {
  // Bundling react application
  const event = await bundler.run();
  if (event.type === "buildSuccess") {
    console.log(
      chalk.green(
        `✨ Successfully build render ${chalk.gray(`(${event.buildTime} ms)`)} `
      )
    );
  }

  // TODO: minify typescript exact code

  // Then build an electron
})().catch(console.error);
