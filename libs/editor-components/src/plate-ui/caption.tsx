import React, {
  ComponentProps,
  CSSProperties,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  captionGlobalStore,
  CaptionOptions,
  TCaptionElement,
  TextareaAutosize,
} from '@udecode/plate-caption';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@decipad/ui';
import {
  findNodePath,
  focusEditor,
  getNodeString,
  getPointAfter,
  setNodes,
  TElement,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import { useSelected } from 'slate-react';
import { Path } from 'slate';
import isHotkey from 'is-hotkey';

const getResponsiveWidth = (style?: CSSProperties) => ({
  ...style,
  width: '100%',
  maxWidth: style?.width,
});

const captionVariants = cva('max-w-full', {
  variants: {
    align: {
      left: 'mr-auto',
      center: 'mx-auto',
      right: 'ml-auto',
    },
  },
  defaultVariants: {
    align: 'center',
  },
});

const useCaptionString = () => {
  const { caption: nodeCaption = [{ children: [{ text: '' }] }] } =
    useElement<TCaptionElement>();

  return useMemo(() => {
    return getNodeString(nodeCaption[0] as any) || '';
  }, [nodeCaption]);
};

const useCaptionState = (options: CaptionOptions = {}) => {
  const captionString = useCaptionString();

  const selected = useSelected();
  const { readOnly } = options;

  return {
    captionString,
    selected,
    readOnly,
  };
};

const useCaption = (state: ReturnType<typeof useCaptionState>) => {
  return {
    hidden:
      state.captionString.length === 0 && (state.readOnly || !state.selected),
  };
};

const Caption = React.forwardRef<
  React.ElementRef<'figcaption'>,
  ComponentProps<'figcaption'> &
    VariantProps<typeof captionVariants> & {
      readOnly?: boolean;
    }
>(({ className, align, style, readOnly, ...props }, ref) => {
  const state = useCaptionState({ readOnly });
  const { hidden } = useCaption(state);

  if (hidden) return null;

  return (
    <figcaption
      ref={ref}
      className={cn(captionVariants({ align }), className)}
      style={getResponsiveWidth(style)}
      {...props}
    />
  );
});
Caption.displayName = 'Caption';

const useCaptionTextareaFocus = (
  textareaRef: RefObject<HTMLTextAreaElement>
) => {
  const editor = useEditorRef();
  const element = useElement<TCaptionElement>();

  const focusCaptionPath = captionGlobalStore.use.focusEndCaptionPath();

  useEffect(() => {
    if (focusCaptionPath && textareaRef.current) {
      const path = findNodePath(editor, element);
      if (path && Path.equals(path, focusCaptionPath)) {
        textareaRef.current.focus();
        captionGlobalStore.set.focusEndCaptionPath(null);
      }
    }
  }, [editor, element, focusCaptionPath, textareaRef]);
};

const useCaptionTextareaState = ({ readOnly }: CaptionOptions = {}) => {
  const element = useElement<TCaptionElement>();

  const {
    caption: nodeCaption = [{ children: [{ text: '' }] }] as [TElement],
  } = element;

  const [captionValue, setCaptionValue] = useState<any>(
    getNodeString(nodeCaption[0])
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useCaptionTextareaFocus(textareaRef);

  return {
    textareaRef,
    captionValue,
    setCaptionValue,
    element,
    readOnly,
  };
};

const useCaptionTextarea = ({
  textareaRef,
  captionValue,
  setCaptionValue,
  element,
  readOnly,
}: ReturnType<typeof useCaptionTextareaState>) => {
  const editor = useEditorRef();

  const onChange: any = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // local state
      setCaptionValue(newValue);

      const path = findNodePath(editor, element);
      if (!path) return;

      // saved state
      setNodes<TCaptionElement>(
        editor,
        { caption: [{ text: newValue }] },
        { at: path }
      );
    },
    [editor, element, setCaptionValue]
  );

  const onKeyDown: any = (e: any) => {
    // select image
    if (isHotkey('up', e)) {
      const path = findNodePath(editor, element);
      if (!path) return;

      e.preventDefault();

      focusEditor(editor, path);
    }

    // select next block
    if (isHotkey('down', e)) {
      const path = findNodePath(editor, element);
      if (!path) return;

      const nextNodePath = getPointAfter(editor, path);
      if (!nextNodePath) return;

      e.preventDefault();

      focusEditor(editor, nextNodePath);
    }
  };

  return {
    ref: textareaRef,
    props: {
      value: captionValue,
      readOnly,
      onChange,
      onKeyDown,
    },
  };
};

const CaptionTextarea = React.forwardRef<
  React.ElementRef<typeof TextareaAutosize>,
  ComponentProps<typeof TextareaAutosize>
>(({ className, readOnly, ...rest }) => {
  const state = useCaptionTextareaState({ readOnly });
  const { ref, props } = useCaptionTextarea(state);

  return (
    <TextareaAutosize
      ref={ref}
      className={cn(
        'mt-2 w-full resize-none border-none bg-inherit p-0 font-[inherit] text-inherit',
        'focus:outline-none focus:[&::placeholder]:opacity-0',
        'text-center',
        className
      )}
      {...props}
      {...rest}
    />
  );
});
CaptionTextarea.displayName = 'CaptionTextarea';

export { Caption, CaptionTextarea };
