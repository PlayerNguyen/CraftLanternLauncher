import path from "path";
import { BrowserWindow } from "electron";
import needle from "needle";
import { EventEmitter } from "events";
import {
  DownloadItem,
  HashableDownloadItem,
  DownloadEvent,
  DownloadProgress,
} from "./Downloader";
import fs from "fs";
import { Queue } from "../utils/Queue";
import { createSha1HashStream } from "../security/Security";

export declare interface DownloaderService {
  on(
    event: "data",
    listener: (
      chunk: Buffer,
      item: HashableDownloadItem,
      progress: DownloadProgress
    ) => void
  ): this;
  on(
    event: "progress",
    listener: (
      currentItem: HashableDownloadItem,
      progress: DownloadProgress
    ) => void
  ): this;
  on(event: "error", listener: (error: Error) => void): this;
  on(
    event: "completed",
    listener: (downloadedItem: Array<DownloadItem>) => void
  ): this;

  on(event: "attempt", listener: (item: HashableDownloadItem) => void): this;

  on(event: "corrupted", listener: (item: HashableDownloadItem) => void): this;
}

export declare interface DownloaderService {
  getItemQueue(): Queue<DownloadItem>;

  getCurrentDownloadItem(): DownloadItem | undefined;

  getCompletedItems(): DownloadItem[];

  addItem(...downloadItem: HashableDownloadItem[] | DownloadItem[]): void;

  clearItems(): void;
}

export class DownloaderService extends EventEmitter {
  private downloadQueue = new Queue<HashableDownloadItem>();
  private currentDownloadItem: HashableDownloadItem | undefined;
  private downloadedItems: HashableDownloadItem[] = [];
  private downloadAttempt: number = 0;

  public getItemQueue(): Queue<HashableDownloadItem> {
    return this.downloadQueue;
  }

  public getCurrentDownloadItem(): DownloadItem | undefined {
    return this.currentDownloadItem;
  }

  addItem(...downloadItem: HashableDownloadItem[]): this {
    for (let item of downloadItem) {
      this.downloadQueue.push(item);
    }
    return this;
  }

  public download(downloadItem: HashableDownloadItem): DownloadEvent {
    const downloadEvent = new DownloadEvent();
    if (downloadItem.size) {
      downloadEvent.progress.actualSize = downloadItem.size;
    }
    try {
      const { url, path, size } = downloadItem;

      console.log(
        `Starting to download from ${url} into ${path}. est file size ${size}`
      );
      const downloadStream: NodeJS.ReadableStream = needle.get(url);
      const outputStream: NodeJS.WritableStream = fs.createWriteStream(path);
      const hash = createSha1HashStream(downloadStream);
      downloadStream.pipe(outputStream);

      downloadStream.on("err", (err) => {
        downloadEvent.emit("error", err);
      });

      downloadStream.on("data", (chunk) => {
        // downloadEvent.progress.actualSize = downloadItem.size;
        downloadEvent.progress?.increase(chunk.length);
        downloadEvent.emit("data", downloadItem, chunk, downloadEvent.progress);
      });

      downloadStream.on("finish", () => {
        if (this.verifyFile(hash.digest("hex"))) {
          downloadEvent.emit("finish", downloadItem);
        } else {
          downloadEvent.emit("corrupted", downloadItem);
        }
      });
    } catch (err) {
      downloadEvent.emit("error", err);
    }
    return downloadEvent;
  }

  public downloadItems(options?: DownloadItemOptions) {
    // Check whether the queue is empty or not
    if (!this.hasNext()) {
      throw new Error("The download queue is empty. Must add the item first");
    }
    let currentDownloadItem = this.getItemQueue().pop();
    this.currentDownloadItem = currentDownloadItem;

    // Path checker
    let dirNameItem = path.dirname(this.currentDownloadItem.path);
    if (options?.createDirIfEmpty) {
      fs.mkdirSync(dirNameItem, { recursive: true });
    } else {
      throw new Error(
        `Unable to create and find path ${dirNameItem}, invoke { createDirIfEmpty: true } to allow create`
      );
    }

    let downloadEvent = this.download(this.currentDownloadItem);

    downloadEvent.on("data", (buffer, item, progress) => {
      this.emit("data", buffer, item, progress);
    });

    downloadEvent.on("error", (error) => {
      this.emit("error", error);
    });

    downloadEvent.on("finish", (item: DownloadItem) => {
      this.downloadedItems.push(currentDownloadItem);
      if (this.hasNext()) {
        this.emit("progress", this.currentDownloadItem, downloadEvent.progress);

        this.downloadItems(options);
      } else {
        this.emit("completed", this.downloadedItems);
      }
    });

    downloadEvent.on("corrupted", () => {
      this.downloadAttempt++;
      if (this.downloadAttempt <= 3) {
        console.log(`Failed to verify a file [failed to check sum]`);
        console.log(
          `Attempt to download again: attempt no. ${this.downloadAttempt}`
        );
        // Call attempt event to handle it
        this.emit("attempt");

        // Push the current item into top to re-download it
        this.getItemQueue().pushTop(currentDownloadItem);
        // Start to download from top
        this.downloadItems(options);
      } else {
        this.downloadAttempt = 0;
        console.log(`The file is corrupted or unable to check sum `);
        console.log(`   url: ${currentDownloadItem.url}`);
        console.log(`   path: .../${path.basename(currentDownloadItem.path)}`);
        console.log(`   provided hash: ${currentDownloadItem.hash}`);

        // Remove the file
        fs.rmSync(currentDownloadItem.path);

        this.emit("corrupted", currentDownloadItem);

        // Download next file if possible
        if (this.hasNext()) {
          this.downloadItems(options);
        }
      }
    });
  }

  private hasNext(): boolean {
    return this.getItemQueue().hasNext();
  }

  private verifyFile(hexValue: string): boolean {
    console.log(`    [item_hash]: ${this.currentDownloadItem?.hash}`);
    console.log(`    [hexValue]:  ${hexValue}`);

    return this.currentDownloadItem?.hash === hexValue;
  }

  public clearItems(): void {
    // Clear all items out of queue
    while (this.downloadQueue.hasNext()) {
      this.downloadQueue.pop();
    }

    // Set the current item to undefined
    this.currentDownloadItem = undefined;
  }
}

export declare interface DownloadItemOptions {
  overwrite?: boolean;
  createDirIfEmpty?: boolean;
}
