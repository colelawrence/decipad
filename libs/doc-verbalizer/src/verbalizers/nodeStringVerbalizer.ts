import { getNodeString } from '@udecode/plate';
import { Verbalizer } from './types';

export const nodeStringVerbalizer: Verbalizer = (element) =>
  getNodeString(element);
