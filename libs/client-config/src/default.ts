// these are the values that are good for the development sandbox
// there are no important secrets here, so you can relax.
// we need this to be JS because of our build script, which injects default
// values into the builkd targets.
const defaultEnvValues = {
  REACT_APP_SENTRY_DSN: '',
  REACT_APP_GOOGLE_SHEETS_API_KEY: 'AIzaSyC1rl_w_G-RMx6hJJZRJ9rSbyD00POLIEM',
};

export type SupportedEnvKey = keyof typeof defaultEnvValues;
export function defaultEnv(key: SupportedEnvKey): string {
  return defaultEnvValues[key];
}
