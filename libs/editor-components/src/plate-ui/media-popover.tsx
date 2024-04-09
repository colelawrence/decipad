import {
  isSelectionExpanded,
  useEditorSelector,
  useElement,
  useRemoveNodeButton,
} from '@udecode/plate-common';
import { useSelected } from 'slate-react';
import React, { useEffect } from 'react';
import {
  FloatingMedia as FloatingMediaPrimitive,
  floatingMediaActions,
  useFloatingMediaSelectors,
} from '@udecode/plate-media';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { Icons } from './icons';
import { inputVariants } from './input';
import { Button, buttonVariants } from './button';
import { Separator } from './separator';
import { useIsEditorReadOnly } from '@decipad/react-contexts';

export interface MediaPopoverProps {
  pluginKey?: string;
  children: React.ReactNode;
}

export const MediaPopover = ({ pluginKey, children }: MediaPopoverProps) => {
  const readOnly = useIsEditorReadOnly();
  const selected = useSelected();
  const selectionCollapsed = useEditorSelector(
    (editor) => !isSelectionExpanded(editor),
    []
  );

  const isOpen = !readOnly && selected && selectionCollapsed;
  const isEditing = useFloatingMediaSelectors().isEditing();

  useEffect(() => {
    if (!isOpen && isEditing) {
      floatingMediaActions.isEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const element = useElement();
  const { props: buttonProps } = useRemoveNodeButton({ element });

  if (readOnly) return <>{children}</>;

  return (
    <Popover open={isOpen} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>

      <PopoverContent
        className="w-auto px-1 py-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isEditing ? (
          <div className="flex w-[330px] flex-col">
            <div className="flex items-center">
              <div className="flex items-center pl-2 text-muted-foreground">
                <Icons.link className="w-[18px]" />
              </div>

              <FloatingMediaPrimitive.UrlInput
                className={inputVariants({ variant: 'ghost', h: 'sm' })}
                placeholder="Paste the embed link..."
                options={{
                  pluginKey,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="box-content flex h-9 items-center gap-1">
            <FloatingMediaPrimitive.EditButton
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Edit link
            </FloatingMediaPrimitive.EditButton>

            <Separator orientation="vertical" className="h-5" />

            <Button variant="ghost" size="sms" {...buttonProps}>
              <Icons.delete className="size-4" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
