const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

export const decodeString = (
  buffer: DataView,
  _offset: number
): [string, number] => {
  let offset = _offset;
  const length = buffer.getUint32(offset);
  offset += 4;
  let parent: SharedArrayBuffer | ArrayBuffer = buffer.buffer;
  let bytes: Uint8Array;
  if (hasSharedArrayBuffer && parent instanceof SharedArrayBuffer) {
    // copy the string in the shared array buffer of length length into a new ArrayBuffer
    // This is because the TextDecoder can only decode from an ArrayBuffer
    const oldParentBytes = new Uint8Array(parent, offset, length);
    const newParent = new ArrayBuffer(length);
    // copy all bytes from bytes into newParent
    new Uint8Array(newParent).set(oldParentBytes);
    parent = newParent;
    bytes = new Uint8Array(parent);
  } else {
    bytes = new Uint8Array(parent, offset, length);
  }
  offset += length;
  const decoder = new TextDecoder();
  const result = decoder.decode(bytes);
  return [result, offset];
};
