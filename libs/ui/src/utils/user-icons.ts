import { isValidElementType } from 'react-is';
import * as icons from '../icons';
import { userIconKeys } from '@decipad/editor-types';

userIconKeys.forEach((key) => {
  if (!isValidElementType(icons[key])) {
    throw new Error(`Missing user icon ${key}`);
  }
});
