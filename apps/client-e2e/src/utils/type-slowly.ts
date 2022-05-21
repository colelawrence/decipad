import { timeout } from './timeout';

const waitBetweenKeysMs = 100;

export default async (str: string, p = page) => {
  for (const c of str) {
    p.keyboard.type(c);
    await timeout(waitBetweenKeysMs);
  }
};
