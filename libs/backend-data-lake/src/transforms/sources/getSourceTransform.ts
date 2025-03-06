import { harvest } from './harvest';
import { hubspot } from './hubspot';
import { SourceTransform } from './types';
import { xero } from './xero';

export const getSourceTransform = (source: string): SourceTransform => {
  switch (source) {
    case 'hubspot': {
      return hubspot;
    }
    case 'harvest': {
      return harvest;
    }
    case 'xero': {
      return xero;
    }
  }
  throw new Error(`Source transform not found for ${source}`);
};
