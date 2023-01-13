import crypto from "crypto";

export function createSha1HashStream(stream: NodeJS.ReadableStream) {
  return createHashStream("sha1", stream);
}

export function createSha256Stream(stream: NodeJS.ReadableStream) {
  return createHashStream("sha256", stream);
}

function createHashStream(
  algorithm: string,
  inputStream: NodeJS.ReadableStream
) {
  let _outStream = crypto.createHash(algorithm);
  inputStream.pipe(_outStream);

  return _outStream;
}
