export async function generateHash(objectToBeHashed: any): Promise<string> {
  if (typeof objectToBeHashed === 'symbol') {
    return generateHash(objectToBeHashed.toString());
  }
  const msgUint8 = new TextEncoder().encode(objectToBeHashed);
  if ('crypto' in global) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }
  return msgUint8.toString();
}
