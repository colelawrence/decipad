import { PromiseOrType } from '@decipad/utils';

export interface EncodeToBufferOptions {
  rootValueKeys: Array<string>;
}

export interface CachingConfig<
  TEncodedValue,
  TDecodedValue,
  TArgs extends unknown[],
  TCacheKeyArgs extends unknown[]
> {
  name: string;
  rootValueKeys: Array<string>;
  encode: (value: TDecodedValue) => PromiseOrType<TEncodedValue>;
  decode: (value: TEncodedValue) => PromiseOrType<TDecodedValue>;
  getCacheKeyArgs: (...args: TArgs) => TCacheKeyArgs;
}
