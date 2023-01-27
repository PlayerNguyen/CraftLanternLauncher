import chalk from "chalk";
import needle from "needle";

export function fetchAsStream(url: string) {
  console.log(chalk.bgYellow(`Fetch from url ${url}`));
  return needle.get(url, {
    json: false,
    follow: Number.MAX_SAFE_INTEGER,
    // Return as a Buffer (not JSON code) if fetching json
    decode_response: false,
    parse_response: false,
  });
}
