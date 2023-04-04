import {
  ELEMENT_LIVE_CONNECTION,
  ImportElementSource,
  LiveConnectionElement,
  LiveQueryElement,
} from '@decipad/editor-types';

const databaseSources = new Set<ImportElementSource | undefined>([
  'sqlite',
  'postgresql',
  'mysql',
]);

export const isDatabaseConnection = (
  element: LiveConnectionElement | LiveQueryElement
): boolean =>
  element.type === ELEMENT_LIVE_CONNECTION &&
  databaseSources.has(element.source);
