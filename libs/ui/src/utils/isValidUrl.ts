export const isValidURL = (urlString: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};
