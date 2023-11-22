import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { Link2, Text, Trash } from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  delete: Trash,
  link: Link2,
  text: Text,
};

export const iconVariants = cva('', {
  variants: {
    variant: {
      toolbar: 'h-5 w-5',
      menuItem: 'mr-2 h-5 w-5',
    },
    size: {
      sm: 'mr-2 h-4 w-4',
      md: 'mr-2 h-6 w-6',
    },
  },
  defaultVariants: {},
});
