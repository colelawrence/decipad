import { encode as encodeVanityUrlComponent } from './vanityUrlComponent';

export const SECRET_URL_PARAM = 'secret';

export const getSecretNotebookLink = (
  notebookId: string,
  notebookTitle: string,
  secret: string
): string => {
  const url = new URL(
    `/n/${encodeVanityUrlComponent(notebookTitle, notebookId)}`,
    window.location.origin
  );
  url.searchParams.set(SECRET_URL_PARAM, secret);
  return url.toString();
};
