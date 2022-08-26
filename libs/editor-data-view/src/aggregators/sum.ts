import { Aggregator } from '../types';

export const sum: Aggregator = ({ expressionFilter, columnType }) => {
  switch (columnType) {
    case 'number':
      return `sum(${expressionFilter})`;
  }
  throw new Error(`Don't know how to sum input of type ${columnType}`);
};
