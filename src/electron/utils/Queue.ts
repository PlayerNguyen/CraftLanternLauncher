interface QueueNode<T> {
  value: T;
  next: QueueNode<T> | undefined;
}

export class Queue<T> {
  private head: QueueNode<T> | undefined;
  private tail: QueueNode<T> | undefined;
  public size: number = 0;

  push(item: T) {
    const qNode = { value: item, next: undefined };
    if (!this.head || !this.tail) {
      this.head = qNode;
      this.tail = qNode;
      this.size++;
      return;
    }

    this.tail.next = qNode;
    this.tail = qNode;
    this.size++;
  }
  pop(): T {
    if (!this.head || this.head === null) {
      throw new Error(`Empty queue`);
    }

    let current = this.head;
    if (this.head === this.tail) {
      this.head = undefined;
      this.tail = undefined;
    } else {
      this.head = this.head.next;
    }

    return current.value;
  }

  public hasNext() {
    return this.head !== undefined;
  }

  public toArray(): T[] {
    let arr = [];
    if (this.head === undefined) {
      return [];
    }

    let cur = this.head;
    arr.push(this.head.value);
    while (cur.next !== undefined) {
      cur = cur?.next;
      arr.push(cur.value);
    }

    return arr;
  }
  public pushTop(element: T) {
    const queueElement: QueueNode<T> = {
      value: element,
      next: undefined,
    };
    if (!this.head) {
      this.tail = queueElement;
    } else {
      let firstHead = this.head;
      queueElement.next = firstHead;
    }
    this.head = queueElement;
  }
}
