import { Filter } from '@decipad/editor-types';
import DeciNumber from '@decipad/number';
import { IntegrationBlock } from 'libs/editor-types/src/integrations';

export const elementFilters = (element: IntegrationBlock): Filter[] => {
  if (!element.filters) return [];

  return element.filters.map((filter): Filter => {
    switch (filter.type) {
      case 'string':
        return {
          ...filter,
          value: filter.value,
        };
      case 'number':
        return {
          ...filter,
          value: new DeciNumber(filter.value),
        };
      case 'date':
        return {
          ...filter,
          value: filter.value,
        };
    }
  });
};
