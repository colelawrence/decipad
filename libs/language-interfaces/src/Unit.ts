import type { DeciNumberBase } from '@decipad/number';

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
  exp: DeciNumberBase;
  multiplier: DeciNumberBase;
  known: boolean;
  aliasFor?: Unit[];
  enforceMultiplier?: boolean;
  quality?: string;
  baseQuantity?: BaseQuantity;
  baseSuperQuantity?: BaseQuantity | 'currency';
}

export type UnitOfMeasure = {
  name: string;
  baseQuantity: BaseQuantity;
  canConvertTo?: (unit: BaseQuantity) => boolean;
  convertTo?: (unit: BaseQuantity, n: DeciNumberBase) => DeciNumberBase;
  symbols?: string[];
  aliases?: string[];
  pretty?: string;
  doesNotScaleOnConversion?: true;
  toBaseQuantity: (n: DeciNumberBase) => DeciNumberBase;
  fromBaseQuantity: (n: DeciNumberBase) => DeciNumberBase;
  superBaseQuantity?: 'currency';
};
