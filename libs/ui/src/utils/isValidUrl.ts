export const isValidURL = (
  urlString: string,
  allowRelative: boolean = false
): boolean => {
  try {
    // eslint-disable-next-line no-control-regex
    const invalidCharsPattern = /[\x00-\x1F\x7F|<>"'\\]/;
    if (invalidCharsPattern.test(urlString)) {
      return false;
    }
    if (allowRelative) {
      const parsedRelativeUrl = new URL(urlString, 'https://decipad.com');
      return (
        !!parsedRelativeUrl.host && // if user puts `javascript:` or `data:` this fails
        urlString.startsWith('/') &&
        !urlString.startsWith('//')
      );
    }

    const parsedUrl = new URL(urlString);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    if (allowedProtocols.includes(parsedUrl.protocol)) {
      // http needs host, mailto and tel do not
      return parsedUrl.protocol.startsWith('http') ? !!parsedUrl.host : true;
    }

    return false;
  } catch (e) {
    console.error(urlString);
    return false;
  }
};
