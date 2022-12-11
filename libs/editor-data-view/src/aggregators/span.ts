import { Aggregator } from '../types';

export const span: Aggregator = ({ expressionFilter, columnType }) => {
  switch (columnType) {
    case 'date':
    case 'number':
      return `max(${expressionFilter}) - min(${expressionFilter})`;
  }
  throw new Error(
    `Don't know how to find span for input of type ${columnType}`
  );
};
