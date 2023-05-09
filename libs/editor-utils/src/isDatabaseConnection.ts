import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_DATASET,
  ImportElementSource,
  LiveConnectionElement,
  LiveDataSetElement,
  LiveQueryElement,
} from '@decipad/editor-types';

const databaseSources = new Set<ImportElementSource | undefined>([
  'sqlite',
  'postgresql',
  'mysql',
]);

export const isDatabaseConnection = (
  element: LiveConnectionElement | LiveQueryElement | LiveDataSetElement
): boolean =>
  [ELEMENT_LIVE_CONNECTION, ELEMENT_LIVE_DATASET].includes(element.type) &&
  databaseSources.has(element.source as ImportElementSource);
