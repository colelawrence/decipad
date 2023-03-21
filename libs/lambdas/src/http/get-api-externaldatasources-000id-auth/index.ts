import { auth } from '@decipad/external-data-lambdas';
import handle from '../handle';

export const handler = handle(auth);
