// Copied from backendtypes constant
const MAX_CREDITS_EXEC_COUNT = {
  free: 50,
  pro: 500,
};

export const getLimit = (isPremium: boolean) =>
  isPremium ? MAX_CREDITS_EXEC_COUNT.pro : MAX_CREDITS_EXEC_COUNT.free;

export const TOKENS_TO_CREDITS = 2_000;
