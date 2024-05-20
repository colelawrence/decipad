export const isFatalError = (err?: string) => {
  return (
    err != null &&
    !err.includes('querySelectorAll is not a') &&
    !err.includes('Uncaught')
  );
};
