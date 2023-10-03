#!/usr/bin/env node

import os from 'node:os';
import { pipeline } from 'stream/promises';
import { join } from 'path';
import fetch from 'cross-fetch';
import { Extract as unzip } from 'unzip-stream';
import { x as untar } from 'tar';
import { access, mkdir } from 'fs/promises';
import envPaths from 'env-paths';

async function mkdirP(path) {
  await mkdir(path, { recursive: true });
}
async function exists(path) {
  try {
    await access(path);
  } catch {
    return false;
  }
  return true;
}

const version = '2.9.0';
const types = new Map([
  ['Linux', ['linux', 'tar.gz']],
  ['Darwin', ['darwin', 'tar.gz']],
  ['Windows_NT', ['windows', 'zip']],
]);

const archs = new Map([
  ['x64', 'x86_64'],
  ['arm64', 'aarch64'],
]);

var name = '@nasa-gcn/architect-plugin-search';
var { cache } = envPaths(name);

function getFilename() {
  const os_type = os.type();
  const os_arch = os.arch();
  const typeInfo = types.get(os_type);
  const arch = archs.get(os_arch);
  if (!typeInfo || !arch) {
    throw new Error(
      `No OpenSearch binary is available for your OS type (${os_type}) and architecture (${os_arch}). For supported operating systems, see https://opensearch.org/downloads.html.`
    );
  }
  const [type, ext] = typeInfo;
  return { name: `opensearch-${version}-${type}-${arch}`, ext };
}

async function download(url) {
  console.log('Downloading', url, 'to', cache);
  await mkdirP(cache);
  const { body } = await fetch(url, { cachePath: cache });
  return body;
}

function extractPath() {
  const { name: name2 } = getFilename();
  return join(cache, name2);
}

function baseBinPath() {
  return join(extractPath(), `opensearch-${version}`, 'bin');
}

function binExt() {
  return os.type() === 'Windows_NT' ? '.bat' : '';
}

async function installElasticSearch() {
  const { name: name2, ext } = getFilename();
  const binPath = join(baseBinPath(), `elasticsearch${binExt()}`);
  const binPathExists = await exists(binPath);
  if (!binPathExists) {
    const url = `https://artifacts.opensearch.org/releases/bundle/opensearch/${version}/${name2}.${ext}`;
    const stream = await download(url);
    let extract;
    if (url.endsWith('.tar.gz')) {
      extract = untar({ cwd: extractPath() });
    } else if (url.endsWith('.zip')) {
      extract = unzip({ path: extractPath() });
    } else {
      throw new Error('unknown archive type');
    }
    console.log('Extracting to', extractPath());
    await mkdirP(extractPath());
    await pipeline(stream, extract);
  } else {
    console.log('opensearch already installed in ' + binPath);
  }
  return binPath;
}

async function installElasticSearchPlugins() {
  // const binPath = join(baseBinPath(), `elasticsearch-plugin${binExt()}`);
  // execSync(
  //   `${binPath} install --batch https://github.com/alexklibisz/elastiknn/releases/download/8.8.0.0/elastiknn-8.8.0.0.zip`
  // );
}

const osType = os.type();
if (osType === 'Darwin') {
  console.log(
    'OpenSearch automatic install is not available yet for ' + osType
  );
  process.exit(0);
} else {
  await installElasticSearch();
  await installElasticSearchPlugins();
}
