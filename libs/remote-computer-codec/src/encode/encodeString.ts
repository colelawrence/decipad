export const encodeString = (
  buffer: DataView,
  _offset: number,
  value: string
): number => {
  let offset = _offset;
  const enc = new TextEncoder();
  const encoded = enc.encode(value);
  buffer.setUint32(offset, encoded.length);
  offset += 4;
  for (const byte of encoded) {
    buffer.setUint8(offset, byte);
    offset += 1;
  }
  return offset;
};
