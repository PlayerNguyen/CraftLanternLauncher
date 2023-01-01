import { BrowserWindow } from "electron";
import needle from "needle";
import { EventEmitter } from "events";
import {
  DownloadItem,
  HashableDownloader,
  DownloadProgress,
  HashableDownloadItem,
  DownloadEvent,
} from "./Downloader";
import fs from "fs";
import { Queue } from "../utils/Queue";

export declare interface DownloaderService {
  on(
    event: "data",
    listener: (chunk: Buffer, item: DownloadItem) => void
  ): this;
  on(event: "progress", listener: (currentItem: DownloadItem) => void): this;
  on(event: "error", listener: (currentItem: DownloadItem) => void): this;
  on(
    event: "completed",
    listener: (downloadedItem: Array<DownloadItem>) => void
  ): this;
}

export declare interface DownloaderService {
  getItemQueue(): Queue<DownloadItem>;

  getCurrentDownloadItem(): DownloadItem | undefined;

  getCompletedItems(): DownloadItem[];

  addItem(...downloadItem: DownloadItem[]): void;
}

export class DownloaderService
  extends EventEmitter
  implements HashableDownloader
{
  private downloadQueue = new Queue<DownloadItem>();
  private currentDownloadItem: DownloadItem | undefined;
  private downloadedItems: DownloadItem[] = [];
  private browserWindow: BrowserWindow;

  constructor(browserWindow: BrowserWindow | null) {
    super();
    if (browserWindow === null) {
      throw new Error(`Unable to load browser window from null`);
    }
    this.browserWindow = browserWindow;
  }

  public getItemQueue(): Queue<DownloadItem> {
    return this.downloadQueue;
  }

  public getCurrentDownloadItem(): DownloadItem | undefined {
    return this.currentDownloadItem;
  }

  addItem(...downloadItem: DownloadItem[]): this {
    for (let item of downloadItem) {
      this.downloadQueue.push(item);
    }
    return this;
  }

  public download(
    downloadItem: DownloadItem | HashableDownloadItem
  ): DownloadEvent {
    const downloadEvent = new DownloadEvent();
    try {
      const { url, path, size } = downloadItem;

      console.log(
        `Starting to download from ${url} into ${path}. est file size ${size}`
      );
      const downloadStream: NodeJS.ReadableStream = needle.get(url);
      const outputStream: NodeJS.WritableStream = fs.createWriteStream(path);

      downloadStream.pipe(outputStream);

      downloadStream.on("err", (err) => {
        downloadEvent.emit("error", err);
      });

      downloadStream.on("data", (chunk) => {
        downloadEvent.progress?.increase(chunk.length);
        downloadEvent.emit("data", downloadItem, chunk);
      });

      downloadStream.on("finish", () => {
        downloadEvent.emit("finish", downloadItem);
      });
    } catch (err) {
      downloadEvent.emit("error", err);
    }
    return downloadEvent;
  }

  public downloadItems() {
    // Check whether the queue is empty or not
    if (!this.hasNext()) {
      throw new Error("The download queue is empty. Must add the item first");
    }
    let currentDownloadItem = this.getItemQueue().pop();
    this.currentDownloadItem = currentDownloadItem;
    let downloadEvent = this.download(this.currentDownloadItem);

    downloadEvent.on("data", (buffer, item) => {
      this.emit("data", buffer, item);
    });

    downloadEvent.on("error", (error) => {
      this.emit("error", error);
    });

    downloadEvent.on("finish", () => {
      this.downloadedItems.push(currentDownloadItem);
      if (this.hasNext()) {
        this.emit("progress", this.currentDownloadItem);

        this.downloadItems();
      } else {
        this.emit("completed", this.downloadedItems);
      }
    });
  }

  private hasNext(): boolean {
    return this.getItemQueue().hasNext();
  }

  verifyFile(): void {
    throw new Error("not implemented");
  }
}
