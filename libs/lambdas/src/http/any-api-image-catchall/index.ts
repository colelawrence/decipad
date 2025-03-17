import { notFound } from '@hapi/boom';
import handle from '../handle';
import { generateHandler } from './generate';
import { gifHandler } from './gif';
import { stockHandler } from './stock';
import { unsplashTrackingHandler } from './unsplashTracking';

export const handler = handle(async (event, user) => {
  const method = event.rawPath.replace('/api/image/', '');

  switch (method) {
    case 'generate':
      return generateHandler(event, user);
    case 'gif':
      return gifHandler(event, user);
    case 'stock':
      return stockHandler(event, user);
    case 'unsplash/tracking':
      return unsplashTrackingHandler(event, user);
    default:
      throw notFound(`Method ${method} not found`);
  }
});
