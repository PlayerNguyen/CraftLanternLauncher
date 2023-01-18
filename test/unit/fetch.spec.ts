import { expect } from "chai";
import { fetchAsStream } from "../../src/electron/download/fetch";
import fs from "fs";
import path from "path";
import { getTestOutputDirectory } from "./utils/file";

describe(`fetch.ts`, () => {
  it(`should create a stream `, (done) => {
    let stream = fetchAsStream(`https://www.google.com`);
    expect(stream.listeners.length).to.gt(0);

    done();
  });

  it(`should pipe to a file from stream`, function (done) {
    this.timeout(5000);
    let stream = fetchAsStream(`https://www.google.com`);
    let outputFile = fs.createWriteStream(
      path.resolve(getTestOutputDirectory(), "google.html")
    );

    stream.pipe(outputFile);

    stream.on("close", () => {
      expect(fs.existsSync(getTestOutputDirectory())).to.be.true;
      done();
    });
  });
});
