import { AirbyteSourceCreation } from './types';

const massageStringValue = (value: string): string => {
  if (
    value.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.000Z$/)
  ) {
    return `${value.slice(0, 19)}Z`;
  }
  return value;
};

const massageConnectionConfiguration = (
  connectionConfiguration: object
): object => {
  return Object.fromEntries(
    Object.entries(connectionConfiguration).map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, massageStringValue(value)];
      } else if (typeof value === 'object') {
        return [key, massageConnectionConfiguration(value)];
      }
      return [key, value];
    })
  );
};

export const massageSourceDefinition = (source: AirbyteSourceCreation) => ({
  ...source,
  connectionConfiguration: {
    ...massageConnectionConfiguration(source.connectionConfiguration),
  },
});
