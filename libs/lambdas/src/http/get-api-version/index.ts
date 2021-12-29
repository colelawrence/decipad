import handle from '../handle';
import { version } from '../../../../../package.json';

export const handler = handle(async () => {
  return {
    statusCode: 200,
    body: version,
  };
});
