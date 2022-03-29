export const cleanString = (str: string): string => {
  return JSON.parse(JSON.stringify(str));
};
