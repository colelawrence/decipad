import { Resource } from '@decipad/backendtypes';

export default function parseResourceUri(uri: string): Resource {
  const parts = uri.split('/');
  return {
    type: parts[1],
    id: parts.slice(2).join('/'),
  };
}
