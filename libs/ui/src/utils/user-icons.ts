import { isValidElementType } from 'react-is';
import * as icons from '../icons';

export const userIconKeys = [
  'Announcement',
  'Heart',
  'Pin',
  'ShoppingCart',
  'Coffee',
  'World',
  'Bank',
  'AnnotationWarning',
  'Frame',
  'DollarCircle',
  'Wallet',
  'Star',
  'Crown',
  'Battery',
  'Happy',
  'Key',
  'Moon',
  'Refresh',
  'Health',
  'Card',
  'Music',
  'Movie',
  'People',
  'Server',
  'Leaf',
  'Clock',
  'Percentage',
  'Bolt',
  'Car',
  'Message',
  'Sunrise',
  'Compass',
  'Trophy',
  'Virus',
  'Plane',
  'Education',
  'Spider',
  'Rocket',
  'Sparkles',
  'Beach',
] as const;
userIconKeys.forEach((key) => {
  if (!isValidElementType(icons[key])) {
    throw new Error(`Missing user icon ${key}`);
  }
});

export type UserIconKey = typeof userIconKeys[number];
