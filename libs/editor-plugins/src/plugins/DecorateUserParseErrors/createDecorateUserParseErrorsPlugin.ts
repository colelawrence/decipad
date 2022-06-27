import { Computer } from '@decipad/computer';
import { MyPlatePlugin } from '@decipad/editor-types';
import { decorateUserParseErrors } from './decorateUserParseErrors';

export const createDecorateUserParseErrorsPlugin = (
  computer: Computer
): MyPlatePlugin => ({
  key: 'DECORATE_USER_PARSE_ERRORS_PLUGIN',
  decorate: decorateUserParseErrors(computer),
});
