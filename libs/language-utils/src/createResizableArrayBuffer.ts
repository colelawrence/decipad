const MAX_ARRAY_BUFFER_LENGTH = 20_000_000;

export const createResizableArrayBuffer = (size: number = 1024) => {
  try {
    return new ArrayBuffer(size, {
      maxByteLength: Math.max(MAX_ARRAY_BUFFER_LENGTH, size),
    });
  } catch (err) {
    console.error(
      `Error creating ArrayBuffer with size ${size} and maxByteLength ${MAX_ARRAY_BUFFER_LENGTH}`
    );
    console.trace(err);
    throw err;
  }
};
