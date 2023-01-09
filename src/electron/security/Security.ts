import crypto from "crypto";

export function createSha1HashStream(stream: NodeJS.ReadableStream) {
  let sha1 = crypto.createHash("sha1");
  stream.pipe(sha1);

  return sha1;
}
