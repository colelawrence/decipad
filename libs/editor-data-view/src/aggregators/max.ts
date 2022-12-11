import { Aggregator } from '../types';

export const max: Aggregator = ({ expressionFilter, columnType }) => {
  switch (columnType) {
    case 'date':
    case 'number':
      return `max(${expressionFilter})`;
  }
  throw new Error(`Don't know how to find max input of type ${columnType}`);
};
