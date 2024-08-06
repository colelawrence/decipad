import { notAcceptable } from '@hapi/boom';

export const validateId = (id: string) => {
  if (typeof id !== 'string') {
    throw notAcceptable('element id should be a string');
  }
};
