import { Parcel } from "@parcel/core";
import { AsyncSubscription, BuildSuccessEvent } from "@parcel/types";
import chalk from "chalk";

let bundler = new Parcel({
  entries: "./render/index.html",
  defaultConfig: "@parcel/config-default",
  mode: "development",
  // serveOptions: {
  //   port: 3000,
  // },
  // hmrOptions: {
  //   port: 3000,
  // },
  targets: {
    reactRender: {
      distDir: "./dist/render",
      publicUrl: "./",
    },
  },
});

let event: AsyncSubscription;

(async () => {
  console.log(chalk.bgCyan(`:: Loading renderer server with ParcelJS`));
  event = await bundler.watch((err, build) => {
    console.log(`...........`);

    if (err) {
      throw err;
    }

    if (build !== undefined && build.type === "buildFailure") {
      console.log(build.diagnostics);
    }

    if (build !== undefined && build.type === "buildSuccess") {
      const bundles = build.bundleGraph.getBundles();
      console.log(
        chalk.cyan(
          `${(build.buildTime / 1000).toFixed(3)} s ~ ${chalk.bgGreen(
            bundles.length
          )} files`
        )
      );
    }
  });
})().catch(async (error) => {
  console.error(error);
  await event.unsubscribe();
});
