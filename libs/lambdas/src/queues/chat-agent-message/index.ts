import { onQueueMessage } from '@decipad/backend-notebook-assistant';
import handle from '../handle';

export const handler = handle(onQueueMessage, { timeout: false });
