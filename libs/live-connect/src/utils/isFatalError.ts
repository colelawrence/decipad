export const isFatalError = (err: Error) => {
  return (
    !err.message.includes('querySelectorAll is not a') &&
    !err.message.includes('Uncaught')
  );
};
