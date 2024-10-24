import { nanoid } from 'nanoid';
import { configureScope } from '@sentry/browser';

const TRANSACTION_ID_HEADER_NAME = 'x-transaction-id';

const urlFromString = (href: string) => {
  const base =
    'window' in global && 'location' in window
      ? window.location.origin
      : process.env.DECI_APP_URL_BASE || 'http://localhost:3000';
  return new URL(href, base);
};

export const fetch: typeof global.fetch = (
  input: string | URL | Request,
  init: RequestInit = {}
) => {
  const urlOrReq: URL | Request =
    typeof input === 'string' ? urlFromString(input) : input;

  const { headers = [] } = init;
  const hHeaders = new Headers(headers);
  if (!hHeaders.get(TRANSACTION_ID_HEADER_NAME)) {
    const transactionId = nanoid();
    hHeaders.set(TRANSACTION_ID_HEADER_NAME, transactionId);
    configureScope((scope) => {
      scope.setTag('transaction_id', transactionId);
    });
  }

  const finalInput: string | Request =
    urlOrReq instanceof URL ? urlOrReq.toString() : urlOrReq;

  return global.fetch(finalInput, init);
};
