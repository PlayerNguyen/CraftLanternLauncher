import chalk from "chalk";
import http from "http";
import crypto from "crypto";
import { EventEmitter } from "events";
import { PathLike } from "fs";
import fs from "fs";
import path from "path";
import { Queue } from "../utils/Queue";
import { fetchAsStream } from "./fetch";
import {
  createMd5Stream,
  createSha1HashStream,
  createSha256Stream,
} from "../security/Security";
import needle from "needle";

export interface DownloadItem {
  path: PathLike | string;
  url: string;
  size?: number;
}

export interface HashableDownloadItem extends DownloadItem {
  hash?: {
    algorithm: HashAlgorithm;
    value: string;
  };
}

export type HashAlgorithm = string | "sha256" | "sha1" | "md5";

export class Progress {
  /**
   * The size that will be estimated or set before download item.
   */
  private actualSize: number;
  /**
   * The size when progressing/downloading item.
   */
  private progressSize: number;

  /**
   * The current download item that is progressing.
   */
  private currentItem?: DownloadItem;

  constructor() {
    this.actualSize = 0;
    this.progressSize = 0;
    this.currentItem = undefined;
  }

  public setActualSize(amount: number) {
    this.actualSize = amount;
  }

  public setProgressSize(amount: number) {
    this.progressSize = amount;
  }

  public getActualSize(): number {
    return this.actualSize;
  }

  public getProgressSize(): number {
    return this.progressSize;
  }

  public setCurrentItem(item?: DownloadItem) {
    this.currentItem = item;
  }

  public getCurrentItem(): DownloadItem | undefined {
    return this.currentItem;
  }
}

export interface DownloadOptions {
  mkdirIfNotExists?: boolean;
}

export declare interface Download {
  on(
    event: "data",
    listener: (
      buffer: Buffer,
      downloadItem: DownloadItem,
      downloadProgress: Progress
    ) => void
  ): this;
  on(
    event: "progress",
    listener: (lastDownloadStatus: DownloadedEvent) => void
  ): this;
  on(event: "attempt", listener: (downloadItem: DownloadItem) => void): this;
  on(event: "done", listener: (download: DownloadedEvent[]) => void): this;
  on(event: "error", listener: (error: Error) => void): this;
}

export class Download extends EventEmitter {
  private downloadQueue: Queue<DownloadItem>;
  private progress: Progress;
  private attemptSize: number = 3;

  private attempt: number = 0;

  private downloadHistory: DownloadedEvent[] = new Array();

  private verbose: boolean = false;

  constructor(...items: DownloadItem[] | HashableDownloadItem[]) {
    super();
    this.downloadQueue = new Queue();
    for (let item of items) {
      this.downloadQueue.push(item);
    }
    this.progress = new Progress();
  }

  public addItem(...items: DownloadItem[] | HashableDownloadItem[]) {
    for (let item of items) {
      this.downloadQueue.push(item);
    }
  }

  public setVerbose(verbose: boolean) {
    this.verbose = verbose;
  }

  public setAttemptSize(attemptSize: number) {
    this.attemptSize = attemptSize;
  }

  public start(options?: DownloadOptions) {
    // When queue has no item
    if (!this.downloadQueue.hasNext()) {
      throw new Error(`Empty download queue`);
    }

    if (this.verbose) {
      console.log(`Verbose mode is on for download instance: `);
    }

    try {
      // Get the first item from queue, then start to fetch item
      let willDownloadItem = this.downloadQueue.pop();
      const { path: itemPath, url, size } = willDownloadItem;

      // Allow create directory if empty
      const containsDirectory = path.dirname(itemPath.toString());
      if (!fs.existsSync(containsDirectory)) {
        if (options && options.mkdirIfNotExists) {
          fs.mkdirSync(containsDirectory, { recursive: true });
        } else {
          throw new Error(
            `Unable to find directory ${containsDirectory}, enable { mkdirIfNotExists: true } to make directory when not found`
          );
        }
      }

      const downloadStream = fetchAsStream(url);
      const writeStream = fs.createWriteStream(itemPath);

      // Register events
      downloadStream.on("response", (response: http.IncomingMessage) => {
        this.progress.setCurrentItem(willDownloadItem);
        this.progress.setProgressSize(0);

        // console.log(
        //   path.basename(willDownloadItem.path.toString()),
        //   response.headers
        // );
      });

      // When the actual size has not been provided, get / estimate from HTTP response header
      // property header["content-length"]
      if (size === undefined) {
        downloadStream.on("header", (_code, _headers) => {
          // The size must be a number
          this.progress.setActualSize(
            Number.parseInt(_headers["content-length"])
          );
        });
      } else {
        // Otherwise, set from progress size
        this.progress.setActualSize(size);
      }

      /**
       * When streaming data from readable object through pipe
       */
      downloadStream.on("data", (buffer) => {
        // Update the progress size and emit progress data
        this.progress.setProgressSize(
          this.progress.getProgressSize() + buffer.length
        );
        this.emit("data", buffer, willDownloadItem, this.progress);
      });

      let _hashStream: crypto.Hash;
      let hashableWillDownloadItem: HashableDownloadItem =
        willDownloadItem as HashableDownloadItem;
      if (hashableWillDownloadItem.hash) {
        const { algorithm } = hashableWillDownloadItem.hash;

        switch (algorithm) {
          case "sha1": {
            _hashStream = createSha1HashStream(downloadStream);
            break;
          }
          case "sha256": {
            _hashStream = createSha256Stream(downloadStream);
            break;
          }
          case "md5": {
            _hashStream = createMd5Stream(downloadStream);
            break;
          }
          default: {
            throw new Error(`Unsupported hash algorithm ${algorithm}`);
          }
        }
      }

      downloadStream.on("done", (err) => {
        if (err) {
          return this.emit("error", err);
        }
        if (
          hashableWillDownloadItem.hash &&
          _hashStream.digest("hex") !== hashableWillDownloadItem.hash.value
        ) {
          // Retry to download the file again
          if (this.attempt < this.attemptSize) {
            // Increase the number of attempt
            this.attempt++;

            // Re-download it by push the download item onto the top of the queue
            this.downloadQueue.pushTop(hashableWillDownloadItem);
            this.emit("attempt", hashableWillDownloadItem);
          } else {
            this.downloadHistory.push(
              new DownloadedEvent(hashableWillDownloadItem, "corrupted")
            );

            // Remove the corrupted file
            fs.rmSync(willDownloadItem.path, { force: true });
            console.error(
              new Error(`File has been corrupted ${willDownloadItem.path}`)
            );
          }
        } else {
          this.downloadHistory.push(
            new DownloadedEvent(hashableWillDownloadItem, "success")
          );
          this.attempt = 0;
        }

        if (this.downloadQueue.hasNext()) {
          this.emit(
            "progress",
            this.downloadHistory[this.downloadHistory.length - 1]
          );

          // Start downloading the next file recursively
          this.start(options);
        } else {
          this.emit("done", this.downloadHistory);
        }
      });

      // Streaming the file into writer stream
      downloadStream.pipe(writeStream);
    } catch (error) {
      this.emit(`error`, error);
    }
  }

  public isEmpty() {
    return !this.downloadQueue.hasNext();
  }
}

export type DownloadStatusEvent = "success" | "corrupted" | "failure";

export class DownloadedEvent {
  item: DownloadItem;
  status: DownloadStatusEvent;

  constructor(item: DownloadItem, status: DownloadStatusEvent) {
    this.item = item;
    this.status = status;
  }
}
