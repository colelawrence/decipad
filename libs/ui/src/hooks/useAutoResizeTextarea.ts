import { useEffect, useRef } from 'react';

export const useAutoResizeTextarea =
  (): React.RefObject<HTMLTextAreaElement> => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      const textarea = textareaRef.current;

      if (!textarea) {
        return;
      }
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      };

      textarea.addEventListener('input', adjustHeight);

      // Initial height adjustment
      adjustHeight();

      return () => {
        textarea.removeEventListener('input', adjustHeight);
      };
    }, [textareaRef]);

    return textareaRef;
  };
