import type {
  ImportElementSource,
  LiveConnectionElement,
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
  element: LiveConnectionElement | LiveQueryElement
): boolean =>
  element.type === 'live-conn' && databaseSources.has(element.source);
