import { expect } from "chai";
import { Queue } from "../../src/electron/utils/Queue";
describe("Queue test", () => {
  it(`should create a queue with size`, () => {
    let queue: Queue<number> = new Queue();

    expect(queue.hasNext()).to.be.false;

    queue.push(1);
    expect(queue.hasNext()).to.be.true;
    queue.push(3);
    queue.push(2);

    expect(queue.hasNext()).to.be.true;
    expect(queue.size).to.eq(3);

    expect(queue.pop()).to.eq(1);
    expect(queue.size).to.eq(2);

    queue.pushTop(12);

    expect(queue.size).to.eq(3);
    expect(queue.pop()).to.eq(12);

    expect(queue.toArray()).to.deep.equal([3, 2]);
  });
  it(`Empty queue exception`, () => {
    expect(() => {
      let q = new Queue();
      q.pop();
    }).to.throws(/Empty queue/);
  });
  it(`Return empty array`, () => {
    let q = new Queue();
    expect(q.toArray()).to.be.instanceOf(Array);
    expect(q.toArray().length).to.eq(0);
  });
});
