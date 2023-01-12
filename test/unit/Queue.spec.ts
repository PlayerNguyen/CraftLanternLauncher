import { expect } from 'chai';
import { Queue } from '../../src/electron/utils/Queue';
describe ("Queue test", () => {
  it(`should create a queue with size`, () => {
    let queue: Queue<number> = new Queue();
    queue.push(1);
    queue.push(3);
    queue.push(2);

    expect(queue.hasNext()).to.be.true;
    expect(queue.size).to.eq(3);

    expect(queue.pop()).to.eq(1);
    expect(queue.size).to.eq(2)
  })
})