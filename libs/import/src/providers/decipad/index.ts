export const decipad = {
  name: 'decipad',
  matchUrl: (url: URL): boolean =>
    (url.hostname === 'localhost' || url.hostname.endsWith('.decipad.com')) &&
    url.pathname.startsWith('/n/'),
  import: () => {
    throw new Error(
      'Decipad notebooks are not meant to be imported statically. Use a live connection instead'
    );
  },
};
