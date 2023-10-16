import { getLocalNotebookUpdates } from '@decipad/docsync';

type ExportCallback = () => Promise<void>;

const forceDownload = (fileName: string, file: Blob) => {
  // Create blob link to download
  const url = window.URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  link.parentNode?.removeChild(link);
};

const remoteExportNotebookWithUpdates = async (
  notebookId: string,
  updates?: Uint8Array
): Promise<Blob> => {
  const resp = await fetch(
    `/api/pads/${encodeURIComponent(notebookId)}/export`,
    {
      method: 'POST',
      body: updates,
    }
  );
  if (!resp.ok) {
    console.error(await resp.text());
    throw new Error('Error downloading notebook backups');
  }
  return resp.blob();
};

export const exportNotebook = (notebookId: string): ExportCallback => {
  return async () => {
    const updates = await getLocalNotebookUpdates(notebookId);
    const file = await remoteExportNotebookWithUpdates(notebookId, updates);

    forceDownload(`${notebookId}.zip`, file);
  };
};

const remoteExportNotebookBackups = async (
  notebookId: string
): Promise<Blob> => {
  const resp = await fetch(
    `/api/pads/${encodeURIComponent(notebookId)}/backups/export`,
    {
      method: 'GET',
    }
  );
  if (!resp.ok) {
    console.error(await resp.text());
    throw new Error('Error downloading notebook backups');
  }
  return resp.blob();
};

export const exportNotebookBackups = (notebookId: string): ExportCallback => {
  return async () => {
    const file = await remoteExportNotebookBackups(notebookId);
    forceDownload(`${notebookId}.zip`, file);
  };
};
