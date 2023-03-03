import { Buffer } from 'buffer';

const logsColor = `
  color: green;
`;

export const printReceivedMessage = (m: string | Uint8Array) => {
  const s = m instanceof Uint8Array ? Buffer.from(m).toString('base64') : m;
  // eslint-disable-next-line no-console
  console.debug(`%creceived on WS: ${s}`, logsColor);
};
