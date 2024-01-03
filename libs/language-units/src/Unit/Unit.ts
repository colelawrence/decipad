import type DeciNumber from '@decipad/number';

export type BaseQuantity =
  | 'length'
  | 'area'
  | 'volume'
  | 'pressure'
  | 'force'
  | 'energy'
  | 'mass'
  | 'temperature'
  | 'second'
  | 'month'
  | 'year'
  | 'substance'
  | 'electric current'
  | 'electric charge'
  | 'electrical capacitance'
  | 'electrical resistance'
  | 'electrical conductance'
  | 'luminous intensity'
  | 'luminous flow'
  | 'solid angle'
  | 'voltage'
  | 'speed'
  | 'power'
  | 'frequency'
  | 'information'
  | 'angle'
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'SEK'
  | 'XXX'
  | 'NOK'
  | 'UAH'
  | 'JPY'
  | 'CNY'
  | 'PHP'
  | 'INR'
  | 'RUB'
  | 'TRY'
  | 'KRW'
  | 'THB'
  | 'PLN'
  | 'ILS'
  | 'AED'
  | 'SAR'
  | 'AUD'
  | 'CAD'
  | 'CHF'
  | 'HKD'
  | 'NZD'
  | 'SGD'
  | 'ZAR'
  | 'BRL'
  | 'TWD'
  | 'DKK'
  | 'IDR'
  | 'HUF'
  | 'CZK'
  | 'CLP'
  | 'COP'
  | 'MYR'
  | 'RON'
  | 'BTC'
  | 'ETH';
export interface Unit {
  pretty?: 'string';
  unit: string;
  exp: DeciNumber;
  multiplier: DeciNumber;
  known: boolean;
  aliasFor?: Unit[];
  enforceMultiplier?: boolean;
  quality?: string;
  baseQuantity?: BaseQuantity;
  baseSuperQuantity?: BaseQuantity | 'currency';
}
