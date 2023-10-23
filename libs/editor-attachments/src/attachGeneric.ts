import axios, { AxiosProgressEvent } from 'axios';

export const attachGenericFile = async (
  file: File,
  onUploadProgress: (file: File) => (progressEvent: AxiosProgressEvent) => void,
  getAttachmentForm: (
    file: File
  ) => Promise<undefined | [URL, FormData, string]>,
  onAttached: (handle: string) => Promise<
    | undefined
    | {
        url: URL;
      }
  >
): Promise<undefined | { url: string }> => {
  const attForm = await getAttachmentForm(file);
  if (!attForm) {
    return;
  }
  const [target, form, handle] = attForm;
  form.append('file', file);
  await axios.post(target.toString(), form, {
    onUploadProgress: onUploadProgress(file),
  });
  const onAttachedResponse = await onAttached(handle);
  if (!onAttachedResponse) {
    return;
  }
  return {
    url: onAttachedResponse.url.toString(),
  };
};
