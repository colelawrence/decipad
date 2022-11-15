export const isFatalError = (err?: string) => {
  return (
    !err?.includes('querySelectorAll is not a') && !err?.includes('Uncaught')
  );
};
