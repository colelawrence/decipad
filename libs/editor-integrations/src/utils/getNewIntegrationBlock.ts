import type { IntegrationTypes } from '@decipad/editor-types';
import { ELEMENT_INTEGRATION } from '@decipad/editor-types';
import { Runner } from '@decipad/notebook-tabs';

export function getNotionDbLink(url: string): string | undefined {
  const parsedUrl = url.match(/notion.so\/.*\?v=/);
  if (parsedUrl == null || parsedUrl.length !== 1) {
    return undefined;
  }

  return parsedUrl[0].slice(
    'notion.so/'.length,
    parsedUrl[0].length - '?v='.length
  );
}

export function getNotionDataLink(notionDatabaseId: string): string {
  return `${window.location.origin}/api/externaldatasources/notion/${notionDatabaseId}/data`;
}

/**
 * Helper function to return the correct new integration,
 * with the correct state.
 *
 * Zustand stores can be accessed outside react so this makes the whole process
 * much nicer.
 */
export function getNewIntegration(
  varName: string,
  runner: Runner
): IntegrationTypes.IntegrationBlock {
  return {
    id: runner.id,
    type: ELEMENT_INTEGRATION,
    children: [{ text: varName }],
    typeMappings: runner.types,
    timeOfLastRun: null,
    isFirstRowHeader:
      'isFirstHeaderRow' in runner.options.importer &&
      typeof runner.options.importer.isFirstHeaderRow === 'boolean'
        ? runner.options.importer.isFirstHeaderRow ?? false
        : false,
    integrationType: runner.intoIntegrationType(),
  };
}
