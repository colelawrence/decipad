import { once } from '@decipad/utils';
import type { SupportedEnvKey } from './default';
import { defaultEnv } from './default';

export { defaultEnv };

export const valueOrDefault = (
  key: SupportedEnvKey,
  value?: string
): string => {
  if (!value) {
    // empty string or undefined
    return defaultEnv(key);
  }
  return value;
};

export const thirdParty = once(() => ({
  googleSheets: {
    apiKey: (import.meta as any).env.VITE_GOOGLESHEETS_API_KEY,
  },
}));
