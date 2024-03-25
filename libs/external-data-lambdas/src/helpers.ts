import { ExternalDataSourceRecord } from '@decipad/backendtypes';

export function getResourceUri(externalData: ExternalDataSourceRecord): string {
  if (
    (externalData.workspace_id != null && externalData.padId != null) ||
    (externalData.workspace_id == null && externalData.padId == null)
  ) {
    throw new Error('ExternalData is in incorrect state!');
  }

  if (externalData.workspace_id != null) {
    return `/workspaces/${externalData.workspace_id}`;
  }

  return `/pads/${externalData.padId}`;
}
