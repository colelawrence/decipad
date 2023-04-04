import { once } from 'ramda';
import { ImportElementSource } from '@decipad/editor-types';
import type { InsertLiveConnectionProps } from '../InteractiveParagraph/insertLiveConnection';

const sourcesThatNeedExternalData = once(
  () =>
    new Set<ImportElementSource | undefined>([
      'sqlite',
      'postgresql',
      'mysql',
      'oracledb',
      'cockroachdb',
      'redshift',
      'mariadb',
    ])
);

export const needsToCreateExternalData = (
  props: InsertLiveConnectionProps
): boolean => sourcesThatNeedExternalData().has(props.source);
