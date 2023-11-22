import {
  FloatingLinkUrlInput,
  LinkOpenButton,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
} from '@udecode/plate-link';
import {
  flip,
  offset,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating';
import { Icons } from './icons';
import { cn } from '@decipad/ui';
import { inputVariants } from './input';
import { buttonVariants } from './button';
import { popoverVariants } from './popover';
import { Separator } from './separator';

const floatingOptions: UseVirtualFloatingOptions = {
  placement: 'bottom-start',
  middleware: [
    offset(12),
    flip({
      padding: 12,
      fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
    }),
  ],
};

export const LinkFloatingToolbar = () => {
  const insertState = useFloatingLinkInsertState({
    floatingOptions: {
      ...floatingOptions,
    },
  });

  const {
    props: insertProps,
    ref: insertRef,
    hidden,
    textInputProps,
  } = useFloatingLinkInsert(insertState);

  const editState = useFloatingLinkEditState({
    floatingOptions: {
      ...floatingOptions,
    },
  });
  const {
    props: editProps,
    ref: editRef,
    editButtonProps,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState);

  if (hidden) return null;

  const input = (
    <div className="flex w-[330px] flex-col">
      <div className="flex items-center px-2">
        <div className="flex items-center text-disabled-foreground">
          <Icons.link width={18} />
        </div>

        <FloatingLinkUrlInput
          className={inputVariants({ variant: 'ghost', h: 'sm' })}
          placeholder="Paste link"
        />
      </div>

      <div className="bg-heavy h-px" />

      <div className="flex items-center px-2">
        <div className="flex items-center text-disabled-foreground">
          <Icons.text width={18} />
        </div>
        <input
          className={inputVariants({ variant: 'ghost', h: 'sm' })}
          placeholder="Text to display"
          {...textInputProps}
        />
      </div>
    </div>
  );

  const editContent = !editState.isEditing ? (
    <div className="flex items-center w-auto gap-1 px-2 py-1 h-9">
      <button
        type="button"
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        {...editButtonProps}
      >
        Edit
      </button>

      <Separator orientation="vertical" className="h-5" />

      <button
        type="button"
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        {...unlinkButtonProps}
      >
        Unlink
      </button>

      <Separator orientation="vertical" className="h-5" />

      <LinkOpenButton
        className={buttonVariants({
          variant: 'ghost',
          size: 'sm',
        })}
      >
        Open
      </LinkOpenButton>
    </div>
  ) : (
    input
  );

  return (
    <>
      <div
        className={cn(popoverVariants(), 'w-auto p-0')}
        ref={insertRef}
        {...insertProps}
        style={{ ...insertProps.style, zIndex: 10 }}
      >
        {input}
      </div>

      <div
        className={cn(popoverVariants(), 'w-auto p-0')}
        ref={editRef}
        {...editProps}
        style={{ ...editProps.style, zIndex: 10 }}
      >
        {editContent}
      </div>
    </>
  );
};
