type Fn<T> = () => T;

export const once = <T>(fn: Fn<T>): Fn<T> => {
  let done = false;
  let memo: T | undefined;
  return (): T => {
    if (!done) {
      done = true;
      memo = fn();
    }
    return memo as unknown as T;
  };
};
