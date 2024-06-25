import { PromiseOrType } from '@decipad/utils';

export interface EncodeToBufferOptions {
  rootValueKeys: Array<string>;
}

export interface CacheConfig<TDecodedValue, TEncodedValue> {
  rootValueKeys: Array<string>;
  encode: (value: TDecodedValue) => PromiseOrType<TEncodedValue>;
  decode: (value: TEncodedValue) => PromiseOrType<TDecodedValue>;
}

export interface CachingConfig<
  TEncodedValue,
  TDecodedValue,
  TArgs extends unknown[],
  TCacheKeyArgs extends unknown[]
> extends CacheConfig<TDecodedValue, TEncodedValue> {
  name: string;
  getCacheKeyArgs: (...args: TArgs) => TCacheKeyArgs;
}

export interface Cache<TValue> {
  get(key: string): Promise<TValue | undefined>;
  set(key: string, value: TValue): Promise<void>;
}
