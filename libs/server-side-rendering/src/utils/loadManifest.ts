/* eslint-disable import/no-extraneous-dependencies */
import { fetch } from '@decipad/fetch';
import { app } from '@decipad/backend-config';

export interface Manifest {
  files: {
    'main.js': string;
  } & Record<string, string>;
}
const tryLoadingRemoteManifest = async (): Promise<Manifest> => {
  const base = app().urlBase;
  const manifestUrl = new URL('/asset-manifest.json', base);
  // eslint-disable-next-line no-console
  console.log(`fetching manifest from ${manifestUrl.toString()}`);
  const res = await fetch(manifestUrl);
  if (!res.ok) {
    throw new Error(`Error requesting manifest: ${await res.text()}`);
  }
  return res.json();
};

export const loadManifest = async (): Promise<Manifest> => {
  try {
    return await tryLoadingRemoteManifest();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('failed loading manifest from remote');
    return {
      files: {
        'main.js': '/static/js/bundle.js',
      },
    };
  }
};
