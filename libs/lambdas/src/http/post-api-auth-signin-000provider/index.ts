import { createAuthHandler } from '@decipad/backend-auth';
import { trackingUtmAndReferer } from '../handle';

export const handler = trackingUtmAndReferer(createAuthHandler());
