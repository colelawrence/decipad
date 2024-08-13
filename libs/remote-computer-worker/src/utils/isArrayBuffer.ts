export const isArrayBuffer = (value: unknown): value is ArrayBuffer => {
  return (
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    (typeof value === 'object' && 'byteLength' in (value as object)) // WTF for tests
  );
};
