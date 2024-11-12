import { Filter } from '@decipad/editor-types';
import DeciNumber from '@decipad/number';
import { IntegrationBlock } from 'libs/editor-types/src/integrations';

export const elementFilters = (element: IntegrationBlock): Filter[] => {
  if (!element.filters) return [];

  return element.filters.map((filter): Filter => {
    if (typeof filter.value === 'string') {
      return {
        ...filter,
        value: filter.value,
      };
    }
    if (typeof filter.value === 'object') {
      const value = new DeciNumber(filter.value);
      return {
        ...filter,
        value,
      };
    }
    throw new Error('Invalid filter');
  });
};
