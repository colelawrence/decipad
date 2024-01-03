// Dates are ranges -- this function cuts up a date to its closest specificity
export const dateToArray = (
  date: Date | number | bigint | undefined
): Array<bigint> => {
  if (date == null || Number.isNaN(date)) {
    return [];
  }
  const d = new Date(Number(date));

  return [
    BigInt(d.getUTCFullYear()),
    BigInt(d.getUTCMonth() + 1),
    BigInt(d.getUTCDate()),
    BigInt(d.getUTCHours()),
    BigInt(d.getUTCMinutes()),
    BigInt(d.getUTCSeconds()),
    BigInt(d.getUTCMilliseconds()),
  ];
};
