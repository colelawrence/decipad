import pack from '../../../package.json';

interface Meta {
  version: string;
}

export default function meta(): Meta {
  return {
    version: pack.version,
  };
}
