export const getBody = (body: string | Uint8Array | Buffer): Buffer => {
  if (
    !(body instanceof Uint8Array) &&
    !Buffer.isBuffer(body) &&
    typeof body !== 'string'
  ) {
    throw new Error(`Unsupported body type ${typeof body}`);
  }
  return body instanceof Uint8Array || Buffer.isBuffer(body)
    ? Buffer.from(body)
    : Buffer.from(body, 'base64');
};
