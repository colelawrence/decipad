export const parseRemoteError = (error: string | ArrayBuffer): Error => {
  const message =
    typeof error === 'string' ? error : new TextDecoder().decode(error);
  return new Error(message);
};
