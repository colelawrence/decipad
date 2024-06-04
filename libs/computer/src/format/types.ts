export interface UnitPart {
  type:
    | 'unit'
    | 'unit-literal'
    | 'unit-exponent'
    | 'unit-quality'
    | 'unit-group'
    | 'unit-prefix';
  value: string;
  originalValue?: string; // for values that are prettified
  base?: string; // for unit conversions in the ui
}

export type DeciNumberPart = (
  | Intl.NumberFormatPart
  | { type: 'ellipsis'; value: string }
  | { type: 'roughly'; value: string }
) & {
  originalValue?: string;
  partsOf?: UnitPart[];
};

export type DeciNumberFormatOptions = {
  financialString: string;
  preciseString: string;
  scientificString: string;
};

export type DeciNumberRep = {
  isPrecise: boolean;
  value: number;
  asString: string;
  asStringPrecise: string;
  formatOptions: DeciNumberFormatOptions | null;
  partsOf: DeciNumberPart[];
};

export type UnionDeciNumberRep = DeciNumberRep;

export type IntermediateDeciNumber = Omit<DeciNumberRep, 'asString'>;
