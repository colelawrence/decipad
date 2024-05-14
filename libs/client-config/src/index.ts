import { once } from '@decipad/utils';
import type { SupportedEnvKey } from './default';
import { defaultEnv } from './default';

export { defaultEnv };

const valueOrDefault = (key: SupportedEnvKey, value?: string): string => {
  if (!value) {
    // empty string or undefined
    return defaultEnv(key);
  }
  return value;
};

export const thirdParty = once(() => ({
  googleSheets: {
    apiKey: valueOrDefault('VITE_GOOGLESHEETS_API_KEY'),
  },
}));
