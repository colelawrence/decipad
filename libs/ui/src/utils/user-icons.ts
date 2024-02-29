import { isValidElementType } from 'react-is';
import * as userIcons from '../icons/user-icons';
import { userIconKeys } from '@decipad/editor-types';

userIconKeys.forEach((key) => {
  if (!isValidElementType(userIcons[key])) {
    throw new Error(`Missing user icon ${key}`);
  }
});
