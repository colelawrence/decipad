#!/usr/bin/env node

const { stringify } = require('yaml');
const process = require('node:process');
const { apiSpec } = require('../build');

const domain = process.env.DECI_DOMAIN;
if (!domain) {
  // eslint-disable-next-line no-console
  console.error('Must have a DECI_DOMAIN env var');
  process.exit(1);
}

process.stdout.write(stringify(apiSpec(domain)));
