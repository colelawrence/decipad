// Copied from backendtypes constant
//
export const getLimit = (isPremium: boolean) =>
  isPremium
    ? Number(process.env.REACT_APP_MAX_CREDITS_PRO)
    : Number(process.env.REACT_APP_MAX_CREDITS_FREE);

export const TOKENS_TO_CREDITS = 2_000;
