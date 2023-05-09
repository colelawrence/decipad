import type {
  ImportElementSource,
  LiveConnectionElement,
  LiveDataSetElement,
  LiveQueryElement,
} from '@decipad/editor-types';

const databaseSources = new Set<ImportElementSource | undefined>([
  'sqlite',
  'postgresql',
  'mysql',
  'oracledb',
  'cockroachdb',
  'redshift',
  'mariadb',
]);

export const isDatabaseConnection = (
  element: LiveConnectionElement | LiveQueryElement | LiveDataSetElement
): boolean =>
  ['live-conn'].includes(element.type) &&
  databaseSources.has(element.source as ImportElementSource);
