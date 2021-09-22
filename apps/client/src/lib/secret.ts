export const SECRET_URL_PARAM = 'secret';
export const getSecretPadLink = (
  workspaceId: string,
  padId: string,
  secret: string
): string => {
  const url = new URL(
    `/workspaces/${workspaceId}/pads/${padId}`,
    window.location.origin
  );
  url.searchParams.set(SECRET_URL_PARAM, secret);
  return url.toString();
};
