import asap from '@architect/asap';

const params = { cacheControl: 'max-age=0' };
exports.handler = asap(params);
