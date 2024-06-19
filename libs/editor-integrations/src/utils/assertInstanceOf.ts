export function assertInstanceOf<T>(
  object: unknown,
  protoype: { new (...args: any[]): T }
): asserts object is T {
  if (!(object instanceof protoype)) {
    throw new Error(
      `Failed instanceof assertion. Should be instance of ${protoype}`
    );
  }
}
