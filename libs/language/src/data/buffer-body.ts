export async function bufferBody(
  bodyStream: AsyncIterable<ArrayBuffer>
): Promise<Uint8Array> {
  const buffers: ArrayBuffer[] = [];
  for await (const part of bodyStream) {
    buffers.push(part);
  }
  return concatenate(buffers);
}

function concatenate(buffers: ArrayBuffer[]): Uint8Array {
  const length = totalLength(buffers);
  const concatenated = new Uint8Array(length);
  let pos = 0;
  for (const buffer of buffers) {
    concatenated.set(new Uint8Array(buffer), pos);
    pos += buffer.byteLength;
  }
  return concatenated;
}

function totalLength(buffers: ArrayBuffer[]): number {
  return buffers.reduce((len, buffer) => len + buffer.byteLength, 0);
}
