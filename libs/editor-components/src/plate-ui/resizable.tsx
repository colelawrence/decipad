'use client';

import type { ComponentProps } from 'react';
import React from 'react';
import {
  Resizable as ResizablePrimitive,
  ResizeHandle as ResizeHandlePrimitive,
} from '@udecode/plate-resizable';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from '@decipad/ui';

export const mediaResizeHandleVariants = cva(
  cn(
    'top-0 flex w-6 select-none flex-col justify-center',
    "after:bg-ring after:flex after:h-16 after:w-[3px] after:rounded-[6px] after:opacity-0 after:content-['_'] group-hover:after:opacity-100"
  ),
  {
    variants: {
      direction: {
        left: '-left-3 -ml-1.5 pl-1.5',
        right: '-right-3 -mr-1.5 items-end pr-1.5',
      },
    },
  }
);

const resizeHandleVariants = cva(cn('absolute z-40'), {
  variants: {
    direction: {
      left: 'h-full cursor-col-resize',
      right: 'h-full cursor-col-resize',
      top: 'w-full cursor-row-resize',
      bottom: 'w-full cursor-row-resize',
    },
  },
});

const ResizeHandle = React.forwardRef<
  React.ElementRef<typeof ResizeHandlePrimitive>,
  ComponentProps<typeof ResizeHandlePrimitive> &
    Omit<VariantProps<typeof resizeHandleVariants>, 'direction'>
>(({ className, ...props }, ref) => (
  <ResizeHandlePrimitive
    ref={ref}
    className={cn(
      resizeHandleVariants({ direction: props.options?.direction }),
      className
    )}
    {...props}
  />
));
ResizeHandle.displayName = 'ResizeHandle';

const resizableVariants = cva('h-auto! p-2 rounded-[8px]', {
  variants: {
    align: {
      left: 'mr-auto',
      center: 'mx-auto',
      right: 'ml-auto',
    },
  },
});

const Resizable = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive>,
  ComponentProps<typeof ResizablePrimitive> &
    VariantProps<typeof resizableVariants>
>(({ className, align, ...props }, ref) => (
  <ResizablePrimitive
    ref={ref}
    className={cn(resizableVariants({ align }), className)}
    {...props}
  />
));
Resizable.displayName = 'Resizable';

export { Resizable, ResizeHandle };
