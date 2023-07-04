/* eslint-disable import/no-extraneous-dependencies */
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { fetch } from '@decipad/fetch';
import { baseUrlFromReq } from './baseUrlFromReq';

export interface Manifest {
  files: {
    'main.js': string;
  } & Record<string, string>;
}

export const loadManifest = async (
  req: APIGatewayProxyEvent
): Promise<Manifest> => {
  const base = baseUrlFromReq(req);
  const manifestUrl = new URL('/asset-manifest.json', base);
  // eslint-disable-next-line no-console
  console.log(`fetching manifest from ${manifestUrl.toString()}`);
  const res = await fetch(manifestUrl);
  if (!res.ok) {
    throw new Error(`Error requesting manifest: ${await res.text()}`);
  }
  return res.json();
};
