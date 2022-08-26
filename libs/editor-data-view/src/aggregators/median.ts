import { Aggregator } from '../types';

export const median: Aggregator = ({ expressionFilter, columnType }) => {
  switch (columnType) {
    case 'number':
      return `median(${expressionFilter})`;
  }
  throw new Error(`Don't know how to find median input of type ${columnType}`);
};
