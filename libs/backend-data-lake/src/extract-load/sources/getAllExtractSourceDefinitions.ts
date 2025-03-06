import { DataSource } from '../../types';
import { getExtractSourceDef } from './getExtractSourceDef';

const sourceDefs: Array<DataSource> = ['hubspot', 'harvest', 'xero'];

export const getAllExtractSourceDefinitions = () =>
  sourceDefs.map(getExtractSourceDef);
