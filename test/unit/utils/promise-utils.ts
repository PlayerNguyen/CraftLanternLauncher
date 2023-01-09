export function wrapPromiseWithExecute(
  promise: Promise<any>,
  assertFn: (...args: any) => void,
  doneFn: (error?: Error) => void
) {
  promise
    .then(assertFn)
    .then(() => {
      doneFn();
    })
    .catch(doneFn);
}
