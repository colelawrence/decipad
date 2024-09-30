import { MultipleNodeProxyProperty } from './types';

// Map implementation for the MultipleNodeProxyProperty functor
export const mapProperty = <T, U>(
  property: MultipleNodeProxyProperty<T>,
  f: (value: T) => U
): MultipleNodeProxyProperty<U> =>
  property === 'varies' ? property : { value: f(property.value) };

export const withDefault = <T>(
  property: MultipleNodeProxyProperty<T | null | undefined>,
  defaultValue: T
): MultipleNodeProxyProperty<T> =>
  mapProperty(property, (value) => value ?? defaultValue);
