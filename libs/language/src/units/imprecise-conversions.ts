import Fraction, { F } from '@decipad/fraction';

const dayInSeconds = 86400;
const monthInSeconds = F(dayInSeconds * 30);

/**
 * Convert between base quantities that are almost equivalent
 */
export const impreciseConversions: ImpreciseConversions = {
  month: {
    second: monthInSeconds,
  },
  second: {
    month: F(1).div(monthInSeconds),
  },
};

interface ImpreciseConversions {
  [baseQuantity: string]: {
    [desiredQuantity: string]: Fraction;
  };
}

export const getImpreciseConversionFactor = (from?: string, to?: string) => {
  return from != null && to != null
    ? impreciseConversions[from]?.[to]
    : undefined;
};
