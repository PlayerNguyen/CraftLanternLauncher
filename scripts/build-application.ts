import { Parcel } from "@parcel/core";

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
  console.log(`Bundling render in ${event.buildTime} ms inside ${event.type}`);

  // Then build an electron
})().catch(console.error);
