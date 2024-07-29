import { URL } from 'url';

export const fixURL = (urlString: string): string => {
  const url = new URL(urlString);
  if (url.hostname.endsWith('amazonaws.com') && url.protocol === 'http:') {
    url.protocol = 'https';
  }
  return url.toString();
};
