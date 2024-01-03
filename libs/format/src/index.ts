import { Format, type DeciNumberRep } from '@decipad/remote-computer';

export * from './formatResult';
export * from './formatType';
export * from './formatResultPreview';

const { simpleFormatUnit, formatUnit, formatError, formatNumber } = Format;

export { simpleFormatUnit, formatUnit, formatError, formatNumber };

export { DeciNumberRep };
