// these are the values that are good for the development sandbox
// there are no important secrets here, so you can relax.
// we need this to be JS because of our build script, which injects default
// values into the builkd targets.
const defaultEnvValues = {
  VITE_SENTRY_DSN: '',
};

export type SupportedEnvKey = keyof typeof defaultEnvValues;
export function defaultEnv(key: SupportedEnvKey): string {
  return defaultEnvValues[key];
}
