import { Aggregator } from '../types';

export const average: Aggregator = ({ expressionFilter, columnType }) => {
  switch (columnType) {
    case 'number':
      return `average(${expressionFilter})`;
  }
  throw new Error(`Don't know how to average input of type ${columnType}`);
};
