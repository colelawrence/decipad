import DeciNumber, { N } from '@decipad/number';

const dayInSeconds = 86400;
const monthInSeconds = N(dayInSeconds * 30);
const yearInSeconds = N(31536000);

/**
 * Convert between base quantities that are almost equivalent
 */
export const impreciseConversions: ImpreciseConversions = {
  month: {
    second: monthInSeconds,
  },
  second: {
    month: monthInSeconds.inverse(),
    year: yearInSeconds.inverse(),
  },
  year: {
    second: yearInSeconds,
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
