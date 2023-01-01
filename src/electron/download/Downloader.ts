import { EventEmitter } from "events";

export interface DownloadItem {
  url: string;
  size?: number;
  path: string;
}

export interface HashableDownloadItem extends DownloadItem {
  hash: string;
}

export class DownloadProgress {
  currentSize: number = 0;
  actualSize: number = 0;

  constructor(actualSize: number) {
    this.actualSize = actualSize;
  }

  public increase(value: number) {
    this.currentSize += value;
  }
}

export declare interface DownloadEvent {
  on(event: "error", listener: (item: DownloadItem) => void): this;
  on(event: "finish", listener: (item: DownloadItem) => void): this;
  on(
    event: "data",
    listener: (item: DownloadItem, chunk: Buffer) => void
  ): this;
}
export class DownloadEvent extends EventEmitter {
  progress: DownloadProgress = new DownloadProgress(-1);
  construct(downloadItem: DownloadItem | HashableDownloadItem) {
    this.progress = new DownloadProgress(
      downloadItem.size ? downloadItem.size : -1
    );
  }
}

export interface Downloader extends EventEmitter {
  download(item: DownloadItem | HashableDownloadItem): DownloadEvent;
}

export interface HashableDownloader extends Downloader {
  verifyFile(): void;
}
