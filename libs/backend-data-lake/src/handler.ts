import { routes } from './routes';
import { router } from './utils/router';

export const handler = router(routes());
