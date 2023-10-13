const expectedErrors = [
  'forbidden',
  'not found',
  'could not find',
  'failed to fetch',
];

export const isExpectableServerSideError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return expectedErrors.some((expectedError) =>
    message.includes(expectedError)
  );
};
