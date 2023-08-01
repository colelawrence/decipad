import { FC } from 'react';
import { cssVar } from '../../primitives';

export const ShoppingCart = (): ReturnType<FC> => (
  <svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Shopping Cart</title>
    <path
      d="M7.75 7.75L7 4.75H4.75M7.75 7.75H19.25L17.6128 14.7081C17.4002 15.6115 16.5941 16.25 15.666 16.25H11.5395C10.632 16.25 9.83827 15.639 9.60606 14.7618L7.75 7.75Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 20C10.5523 20 11 19.5523 11 19C11 18.4477 10.5523 18 10 18C9.44772 18 9 18.4477 9 19C9 19.5523 9.44772 20 10 20Z"
      fill={cssVar('iconColorHeavy')}
    />
    <path
      d="M17 20C17.5523 20 18 19.5523 18 19C18 18.4477 17.5523 18 17 18C16.4477 18 16 18.4477 16 19C16 19.5523 16.4477 20 17 20Z"
      fill={cssVar('iconColorHeavy')}
    />
  </svg>
);
