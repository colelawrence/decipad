export const last = <T>(array: {
  [idx: number]: T;
  length: number;
}): T | undefined => {
  return array[array.length - 1];
};
