export const concatMessages = <T extends Uint8Array>(messages: T[]): T => {
  const first = messages[0];
  if (first instanceof Uint8Array) {
    return Buffer.concat(messages as Uint8Array[]) as unknown as T;
  }
  throw new Error(
    `dont know what to do with message of type ${typeof first}:${first}`
  );
};
