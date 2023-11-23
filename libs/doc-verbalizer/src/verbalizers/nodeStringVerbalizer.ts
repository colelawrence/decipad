import { getNodeString } from '../utils/getNodeString';
import { Verbalizer } from './types';

export const nodeStringVerbalizer: Verbalizer = (element) =>
  getNodeString(element);
