export const one = async function* one<T>(value: T): AsyncGenerator<T> {
  yield value;
};
