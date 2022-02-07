import { encode as encodeVanityUrlComponent } from './vanityUrlComponent';

export const SECRET_URL_PARAM = 'secret';

export const getSecretPadLink = (
  workspaceId: string,
  padId: string,
  padTitle: string,
  secret: string
): string => {
  const url = new URL(
    `/workspaces/${workspaceId}/pads/${encodeVanityUrlComponent(
      padTitle,
      padId
    )}`,
    window.location.origin
  );
  url.searchParams.set(SECRET_URL_PARAM, secret);
  return url.toString();
};
