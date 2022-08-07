import Fraction from '@decipad/fraction';
import {
  AST,
  convertToMultiplierUnit,
  normalizeUnitsOf,
  Units,
} from '@decipad/language';
import produce from 'immer';
import pluralize from 'pluralize';
import {
  formatEdgeCaseNumber,
  isEdgeCaseNumber,
} from './formatEdgeCaseNumbers';
import {
  formatUnitAsParts,
  isUserDefined,
  prettyENumbers,
  UnitPart,
} from './formatUnit';
import { getCurrency, getPrettyCurrency, hasCurrency } from './getCurrency';

const DEFAULT_PRECISION = 10;
const MAX_PRECISION = 15;

const DEFAULT_NUMBER_OPTIONS: Intl.NumberFormatOptions = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  notation: 'compact',
  compactDisplay: 'long', // 18 thousand instead of 18K
};
const DEFAULT_CURRENCY_OPTIONS: Intl.NumberFormatOptions = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  compactDisplay: 'long', // 18 thousand instead of 18K
  style: 'currency',
  currencyDisplay: 'narrowSymbol',
};
const LONG_NUMBER_OPTIONS: Intl.NumberFormatOptions = {
  maximumFractionDigits: 20,
  minimumFractionDigits: 0,
  notation: 'scientific',
};
const OTHER_LONG_NUMBER_OPTIONS: Intl.NumberFormatOptions = {
  maximumFractionDigits: 20,
  minimumFractionDigits: 0,
  notation: 'standard',
};

export type DeciNumberPart = (
  | Intl.NumberFormatPart
  | { type: 'ellipsis'; value: string }
  | { type: 'roughly'; value: string }
) & {
  originalValue?: string;
  partsOf?: UnitPart[];
};

export type DeciNumber = {
  isPrecise: boolean;
  value: number;
  asString: string;
  asStringPrecise: string;
  partsOf: DeciNumberPart[];
};

type IntermediateDeciNumber = Omit<DeciNumber, 'asString'>;

export function unpreciseButSafeFractionAsNumber(
  n: Fraction
): [number, number] {
  const roundedNumber = n.round(MAX_PRECISION).valueOf();
  const notRoundedNumber = n.valueOf();
  return [
    roundedNumber,
    Number.isNaN(notRoundedNumber) ? roundedNumber : notRoundedNumber,
  ];
}

function beautifyExponents(partsOf: DeciNumberPart[]): DeciNumberPart[] {
  let ret: DeciNumberPart[] = [];
  let unclean = false;

  partsOf.map((e) => {
    if (
      e.type === 'exponentInteger' ||
      e.type === 'exponentMinusSign' ||
      e.type === 'exponentSeparator'
    ) {
      if (!(e.type === 'exponentInteger' && e.value === '0')) {
        if (e.type === 'exponentSeparator') {
          ret.push({
            type: 'exponentSeparator',
            originalValue: e.value,
            value: '×10',
          });
        } else {
          ret.push({
            type: e.type,
            originalValue: e.value,
            value: prettyENumbers(e.value),
          });
        }
      } else {
        // ignore 1E0 which is just 1.
        unclean = true;
      }
    } else {
      ret.push(e);
    }
  });

  ret = ret.filter((_, pos) => {
    if (unclean) {
      // remove first exponentSeparator, for style
      const firstExpAt = ret.findIndex((e) => e.type === 'exponentSeparator');
      return firstExpAt !== pos;
    }
    return true;
  });

  return ret;
}

export function partsToString(partsOf: DeciNumberPart[]): string {
  return partsOf
    .reduce(
      //
      // we want to join strings with a space, but with exception
      // for multipliers, e.g. `km` not `k m`
      //
      (p, d) =>
        (p + (d.type === 'unit' ? ' ' : '')).replace(/  +/g, ' ') + d.value,
      ''
    )
    .trim();
}

function isLargeNumber(x: Fraction): boolean {
  return x.compare(new Fraction(1_000_000_000_000_000n)) > 0;
}

function isLessThan10k(x: Fraction): boolean {
  return x.compare(new Fraction(10_000n)) < 0;
}

export const getIsPrecise = (
  n: Fraction,
  places = 2,
  largeNumbersGetAbbreviated = true
): boolean => {
  // eslint-disable-next-line no-param-reassign
  n = n.abs();

  // Is this fraction equal to itself rounded?
  if (!n.equals(n.round(places))) {
    return false;
  }

  if (!largeNumbersGetAbbreviated) {
    return true;
  }

  // else, 1 100 001 will be displayed as 1.1M, the 1-off is imprecision. Let's go

  const [integerStr, fractionStr] = n.toString().split('.');

  if (integerStr.length <= 3) {
    return true;
  }

  if (fractionStr) {
    // The number is larger than 999 so it's at least going to use K.
    // When K is used the fractional part disappears.
    return false;
  }

  // 678_000 is not rounded but 67_800 is :'(
  if (/^\d\d\d0*$/.test(integerStr)) {
    return true;
  }

  return false;
};

const formatToParts = (
  locale: string,
  args: Intl.NumberFormatOptions,
  n: Fraction,
  mapParts: (num: DeciNumberPart[]) => DeciNumberPart[]
): IntermediateDeciNumber => {
  const [value, useSafeN] = unpreciseButSafeFractionAsNumber(n);

  const places = args.maximumFractionDigits ?? DEFAULT_PRECISION;
  // todo: review, is this enough? @pgte

  let partsOf: DeciNumberPart[];
  let isPrecise: boolean;

  if (isEdgeCaseNumber(n)) {
    // Number is too large or too small for floats
    const placeholder = 99;
    partsOf = new Intl.NumberFormat(locale, args)
      .formatToParts(placeholder)
      .flatMap((part): DeciNumberPart[] => {
        if (part.type === 'integer' && part.value === String(placeholder)) {
          return formatEdgeCaseNumber(n, places);
        }
        return [part];
      });
    isPrecise = getIsPrecise(n, places, false);
  } else {
    partsOf = new Intl.NumberFormat(locale, args).formatToParts(useSafeN);
    isPrecise = getIsPrecise(n, places, args.notation !== 'standard');
  }

  if (!isPrecise) {
    partsOf = [{ type: 'roughly', value: '≈' }, ...partsOf];
  }

  let asStringPrecise;
  if (Math.abs(useSafeN) > Number.MAX_SAFE_INTEGER) {
    asStringPrecise = partsToString(formatEdgeCaseNumber(n, MAX_PRECISION));
  } else {
    const fmt = new Intl.NumberFormat(
      locale,
      Math.abs(useSafeN) > 1e10 || Math.abs(useSafeN) < 1 / 1e10
        ? LONG_NUMBER_OPTIONS
        : OTHER_LONG_NUMBER_OPTIONS
    );
    asStringPrecise = partsToString(
      beautifyExponents(fmt.formatToParts(useSafeN))
    );
  }

  return { isPrecise, partsOf: mapParts(partsOf), value, asStringPrecise };
};

function formatCurrency(locale: string, unit: Units, fraction: Fraction) {
  const currency = getCurrency(unit);

  const numberFormatOptions: Intl.NumberFormatOptions = {
    ...DEFAULT_CURRENCY_OPTIONS,
    currency: (currency.baseQuantity || currency.unit).toLocaleUpperCase(),
    notation: isLargeNumber(fraction)
      ? 'engineering'
      : isLessThan10k(fraction)
      ? 'standard'
      : 'compact',
  };

  return formatToParts(locale, numberFormatOptions, fraction, (parts) =>
    parts.map((u) => {
      if (u.type === 'currency') {
        return { type: 'currency', value: getPrettyCurrency(u.value) };
      }
      return u;
    })
  );
}

function formatUnitless(
  locale: string,
  fraction: Fraction
): IntermediateDeciNumber {
  const formattingOptions: Intl.NumberFormatOptions = {
    ...DEFAULT_NUMBER_OPTIONS,
    ...(isLargeNumber(fraction) ||
    (fraction.mod(10).compare(0) !== 0 &&
      fraction.compare(new Fraction(0.01)) < 0)
      ? { notation: 'engineering' }
      : isLessThan10k(fraction)
      ? { notation: 'standard' }
      : {}),
  };

  return formatToParts(locale, formattingOptions, fraction, (x) => x);
}

function formatUserDefinedUnit(
  locale: string,
  unit: Units,
  fraction: Fraction
) {
  const args: Intl.NumberFormatOptions = { ...DEFAULT_NUMBER_OPTIONS };

  if (isLargeNumber(fraction)) {
    args.notation = 'engineering';
  }
  if (isLessThan10k(fraction)) {
    args.notation = 'standard';
  }
  args.style = 'unit';
  // NumberFormat doesnt accept crazy units
  // so we need to provide one that it does, and then pluralize it
  args.unit = 'meter';

  return formatToParts(locale, args, fraction, (parts) =>
    parts.map((u) => {
      const [, valOf] = unpreciseButSafeFractionAsNumber(fraction);
      if (u.type === 'unit') {
        return {
          type: 'unit',
          value: pluralize(unit.args[0].unit, valOf),
        };
      }
      return u;
    })
  );
}

function formatAnyUnit(locale: string, units: Units, fraction: Fraction) {
  const args = { ...DEFAULT_NUMBER_OPTIONS };

  // dont show smart `thousand` instead of K if things are too big
  if (units && units.args.length > 1) {
    args.compactDisplay = 'short';
  }

  if (isLargeNumber(fraction)) {
    args.notation = 'engineering';
  }

  if (isLessThan10k(fraction)) {
    args.notation = 'standard';
  }

  return formatToParts(locale, args, fraction, (parts) => {
    if (units) {
      return [...parts, formatUnitAsParts(locale, units, fraction)];
    }
    return parts;
  });
}

function formatAnyCurrency(locale: string, units: Units, fraction: Fraction) {
  const currencyIndex = hasCurrency(units);
  const currencyUnit: Units = {
    type: 'units',
    args: [units.args[currencyIndex]],
  };
  const unitsWithoutCurrency = produce(units, (uns) => {
    uns.args.map((_, i) => {
      if (i === currencyIndex) {
        // eslint-disable-next-line no-param-reassign
        uns.args.splice(i, 1);
      }
    });
  });

  const otherUnitsMult = (unitsWithoutCurrency.args || []).reduce(
    (ac, current) => {
      return ac.mul(current.multiplier);
    },
    new Fraction(1)
  );

  const partsOfUnits =
    unitsWithoutCurrency.args.length > 0
      ? formatAnyUnit(
          locale,
          unitsWithoutCurrency,
          new Fraction(1)
        ).partsOf.filter((e, i) => !(i === 0 && e.value === '1'))
      : [];

  const partsOfCurrency = formatCurrency(
    locale,
    produce(currencyUnit, (cu) => {
      // eslint-disable-next-line no-param-reassign
      cu.args[0].multiplier = new Fraction(1);
    }),
    fraction.mul(otherUnitsMult)
  );

  return {
    ...partsOfCurrency,
    partsOf: partsOfCurrency.partsOf.concat(partsOfUnits),
  };
}

//
// dear reader, my dear reader
//
// if you take something from my book, let it be this:
// 1000 meters with multiplier of 1000 means, 1000 meters, displayed as km
//
// it does not, i repeat
// it does absolu-banana-lutely does not mean 1000 km.
// you will loose countless hours of coding if you dont believe me
// and you will literally
// go
// ...
// bananas....
//
export function formatNumber(
  locale: string,
  unit: Units | null | undefined,
  number: Fraction,
  numberFormat: AST.NumberFormat | null = undefined
): DeciNumber {
  const fraction = new Fraction(number);

  if (numberFormat === 'percentage') {
    const mulFraction = fraction.mul(100);
    const formatted = formatNumber(locale, null, mulFraction);
    const partsOf: DeciNumberPart[] = [
      ...formatted.partsOf,
      { type: 'literal', value: '%' },
    ];
    return {
      ...formatted,
      partsOf,
      asString: partsToString(partsOf),
    };
  }

  let deciNumber: IntermediateDeciNumber;
  if (unit) {
    const units = normalizeUnitsOf(unit) as Units;

    if (hasCurrency(units) !== -1) {
      deciNumber = formatAnyCurrency(locale, units, fraction);
    } else if (isUserDefined(units)) {
      deciNumber = formatUserDefinedUnit(locale, units, fraction);
    } else {
      const scaledToUnit = convertToMultiplierUnit(fraction, units);
      deciNumber = formatAnyUnit(locale, units, scaledToUnit);
    }
  } else {
    deciNumber = formatUnitless(locale, fraction);
  }

  const { partsOf } = deciNumber;
  const ret: DeciNumberPart[] = beautifyExponents(partsOf);

  return { ...deciNumber, asString: partsToString(ret), partsOf: ret };
}

export type FormatNumber = typeof formatNumber;
