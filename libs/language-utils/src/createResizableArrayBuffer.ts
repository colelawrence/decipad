const MAX_ARRAY_BUFFER_LENGTH = 50_000_000;

export const createResizableArrayBuffer = (size: number = 1024) =>
  new ArrayBuffer(size, {
    maxByteLength: MAX_ARRAY_BUFFER_LENGTH,
  });
