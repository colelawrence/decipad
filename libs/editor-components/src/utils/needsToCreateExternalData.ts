import type { ImportElementSource } from '@decipad/editor-types';
import { once } from '@decipad/utils';
import type { InsertLiveConnectionProps } from '../types';

const sourcesThatNeedExternalData = once(
  () =>
    new Set<ImportElementSource | undefined>([
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
