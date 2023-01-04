import { FC } from 'react';
import { offWhite, orange100, orange300, orange500 } from '../../primitives';

export const Calculations = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>SlashCommandCal</title>
    <rect width="40" height="40" rx="6" fill={orange100.rgb} />
    <path
      d="M23 28.3125V24.5625C23 23.6996 23.6996 23 24.5625 23H28.3125C29.1754 23 29.875 23.6996 29.875 24.5625V28.3125C29.875 29.1754 29.1754 29.875 28.3125 29.875H24.5625C23.6996 29.875 23 29.1754 23 28.3125Z"
      fill="white"
      stroke={orange500.rgb}
      strokeWidth="1.3"
    />
    <path
      d="M11.7499 29.9307V22.9014C11.7499 22.6642 12.0038 22.5135 12.2121 22.6271L18.16 25.8714C18.3688 25.9853 18.3788 26.2816 18.1781 26.4094L12.2302 30.1944C12.0222 30.3268 11.7499 30.1773 11.7499 29.9307Z"
      stroke={orange300.rgb}
      fill={offWhite.rgb}
      strokeWidth="1.3"
    />
    <circle
      cx="14.875"
      cy="14.875"
      r="3.725"
      fill="white"
      stroke={orange500.rgb}
      strokeWidth="1.3"
    />
    <path
      d="M22.375 18.625L30.5 10.5M22.375 10.5L30.5 18.625"
      stroke={orange300.rgb}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);
