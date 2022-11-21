/* eslint-disable no-param-reassign */
// MIT License
//
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import pluralize from 'pluralize';
import { DeciNumberPart } from './formatNumber';

//
export interface Options {
  secondsDecimalDigits?: number;
  timeDecimalDigits?: number;
  keepDecimalsOnWholeTime?: boolean;
  verbose?: boolean;
  separateTime?: boolean;
  formatSubTime?: boolean;
  colonNotation?: boolean;
}

export function parseMilliseconds(milliseconds: number) {
  return {
    days: Math.trunc(milliseconds / 86_400_000),
    hours: Math.trunc(milliseconds / 3_600_000) % 24,
    minutes: Math.trunc(milliseconds / 60_000) % 60,
    seconds: Math.trunc(milliseconds / 1_000) % 60,
    milliseconds: Math.trunc(milliseconds) % 1_000,
    microseconds: Math.trunc(milliseconds * 1_000) % 1_000,
    nanoseconds: Math.trunc(milliseconds * 1e6) % 1_000,
  };
}

export function parseMonths(months: number) {
  return {
    millennium: Math.trunc(months / 12_000),
    century: Math.trunc(months / 1_200) % 10,
    decade: Math.trunc(months / 120) % 10,
    year: Math.trunc(months / 12) % 10,
  };
}

const SECOND_ROUNDING_EPSILON = 0.000_000_1;

export default function prettyTime(
  time: number,
  options: Options
): DeciNumberPart[] {
  if (options.colonNotation) {
    options.formatSubTime = false;
    options.separateTime = false;
    options.verbose = false;
  }

  const result: DeciNumberPart[] = [];

  const floorDecimals = (value: number, decimalDigits: number) => {
    const flooredInterimValue = Math.floor(
      value * 10 ** decimalDigits + SECOND_ROUNDING_EPSILON
    );
    const flooredValue = Math.round(flooredInterimValue) / 10 ** decimalDigits;
    return flooredValue.toFixed(decimalDigits);
  };

  const add = (
    value: number,
    long: string,
    short: string,
    valueString: string = value.toString()
  ) => {
    if (
      (result.length === 0 || !options.colonNotation) &&
      value === 0 &&
      !(options.colonNotation && short === 'm')
    ) {
      return;
    }

    let prefix;
    let suffix;
    if (options.colonNotation) {
      prefix = result.length > 0 ? ':' : '';
      suffix = '';
      const wholeDigits = valueString.includes('.')
        ? valueString.split('.')[0].length
        : valueString.length;
      const minLength = result.length > 0 ? 2 : 1;
      valueString =
        '0'.repeat(Math.max(0, minLength - wholeDigits)) + valueString;
      if (prefix.trim() !== '') {
        result.push({
          type: 'unit',
          value: prefix.trim(),
          originalValue: suffix || long,
        });
      }
    } else {
      prefix = '';
      suffix = options.verbose ? pluralize(long, value) : short;
    }

    result.push({ type: 'integer', value: valueString });

    if (!options.colonNotation) {
      result.push({
        type: 'unit',
        value: suffix || long,
      });
      result.push({ type: 'literal', value: ' ' });
    }
  };

  const parsed = parseMilliseconds(time);

  add(Math.trunc(parsed.days / 365), 'year', 'y');
  add(parsed.days % 365, 'day', 'd');
  add(parsed.hours, 'hour', 'h');
  add(parsed.minutes, 'minute', 'm');

  if (
    options.separateTime ||
    options.formatSubTime ||
    (!options.colonNotation && time < 1000)
  ) {
    add(parsed.seconds, 'second', 's');
    if (options.formatSubTime) {
      add(parsed.milliseconds, 'millisecond', 'ms');
      add(parsed.microseconds, 'microsecond', 'µs');
      add(parsed.nanoseconds, 'nanosecond', 'ns');
    } else {
      const millisecondsAndBelow =
        parsed.milliseconds +
        parsed.microseconds / 1000 +
        parsed.nanoseconds / 1e6;

      const millisecondsDecimalDigits =
        typeof options.timeDecimalDigits === 'number'
          ? options.timeDecimalDigits
          : 0;

      const roundedMiliseconds =
        millisecondsAndBelow >= 1
          ? Math.round(millisecondsAndBelow)
          : Math.ceil(millisecondsAndBelow);

      const millisecondsString = millisecondsDecimalDigits
        ? millisecondsAndBelow.toFixed(millisecondsDecimalDigits)
        : roundedMiliseconds;

      add(
        Number.parseFloat(millisecondsString.toString()),
        'millisecond',
        'ms',
        millisecondsString.toString()
      );
    }
  } else {
    const seconds = (time / 1000) % 60;
    const secondsDecimalDigits =
      typeof options.secondsDecimalDigits === 'number'
        ? options.secondsDecimalDigits
        : 1;
    const secondsFixed = floorDecimals(seconds, secondsDecimalDigits);
    const secondsString = options.keepDecimalsOnWholeTime
      ? secondsFixed
      : secondsFixed.replace(/\.0+$/, '');
    add(Number.parseFloat(secondsString), 'second', 's', secondsString);
  }

  return result;
}

export function prettifyTimeMs(
  time: number,
  options: Options = {}
): DeciNumberPart[] {
  const partsOf = prettyTime(time, options);
  return partsOf.filter((v, i) => {
    if (i === partsOf.length - 1) {
      return v.value !== ' ';
    }
    return true;
  });
}
