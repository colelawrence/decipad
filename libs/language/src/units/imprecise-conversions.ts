import DeciNumber, { N } from '@decipad/number';

const dayInSeconds = 86400;
const monthInSeconds = N(dayInSeconds * 30);

/**
 * Convert between base quantities that are almost equivalent
 */
export const impreciseConversions: ImpreciseConversions = {
  month: {
    second: monthInSeconds,
  },
  second: {
    month: N(1).div(monthInSeconds),
  },
};

interface ImpreciseConversions {
  [baseQuantity: string]: {
    [desiredQuantity: string]: DeciNumber;
  };
}

export const getImpreciseConversionFactor = (from?: string, to?: string) => {
  return from != null && to != null
    ? impreciseConversions[from]?.[to]
    : undefined;
};
