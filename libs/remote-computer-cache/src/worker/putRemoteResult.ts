import { fetch } from '@decipad/fetch';
import { CreateAttachmentFormResult } from '../types';

export const putRemoteResult = async <T>(
  notebookId: string,
  result: T,
  encode: (o: T) => Promise<ArrayBuffer>,
  protocolVersion: number
) => {
  const formFetchResult = await fetch(
    `/api/pads/${encodeURIComponent(notebookId)}/computercache`,
    {
      method: 'POST',
    }
  );
  if (!formFetchResult.ok) {
    if (formFetchResult.status.toString().startsWith('4')) {
      // user error
      // eslint-disable-next-line no-console
      console.warn(
        'Remote cache put: user error (user is probably not authorized)'
      );
      return;
    }

    // eslint-disable-next-line no-console
    console.error(
      'Failed to fetch remote cache form',
      formFetchResult.statusText,
      await formFetchResult.text()
    );
    throw new Error(
      `Failed to fetch remote cache for notebook ${notebookId}: ${formFetchResult.statusText}`
    );
  }

  const form = (await formFetchResult.json()) as CreateAttachmentFormResult;

  const formData = new FormData();
  for (const [key, value] of Object.entries(form.fields)) {
    formData.append(key, value);
  }

  // encode result
  const encoded = await encode(result);
  const header = new DataView(new ArrayBuffer(4));
  header.setUint32(0, protocolVersion);
  formData.append('file', new Blob([header, encoded]), form.key);

  const putResult = await fetch(form.url, {
    body: formData,
    method: 'POST',
  });

  if (!putResult.ok) {
    // eslint-disable-next-line no-console
    console.error(
      'Failed to put remote cache',
      putResult.statusText,
      await putResult.text()
    );
    throw new Error(
      `Failed to put remote cache for notebook ${notebookId}: ${putResult.statusText}`
    );
  }
};
