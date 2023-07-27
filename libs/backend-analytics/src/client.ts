/* eslint-disable no-console */
import AnalyticsClient from 'analytics-node';
import { analytics } from '@decipad/backend-config';
import { once } from '@decipad/utils';

const { secretKey } = analytics();
export const analyticsClient = once(
  () =>
    secretKey && new AnalyticsClient(secretKey, { flushAt: 1, enable: true })
);
