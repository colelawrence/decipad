import { Aggregator } from '../types';

export const min: Aggregator = ({ expressionFilter, columnType }) => {
  switch (columnType) {
    case 'number':
      return `min(${expressionFilter})`;
  }
  throw new Error(`Don't know how to find min input of type ${columnType}`);
};
