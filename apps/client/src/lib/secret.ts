import { encode as encodeVanityUrlComponent } from './vanityUrlComponent';

export const SECRET_URL_PARAM = 'secret';

export const getSecretPadLink = (
  padId: string,
  padTitle: string,
  secret: string
): string => {
  const url = new URL(
    `/n/${encodeVanityUrlComponent(padTitle, padId)}`,
    window.location.origin
  );
  url.searchParams.set(SECRET_URL_PARAM, secret);
  return url.toString();
};
