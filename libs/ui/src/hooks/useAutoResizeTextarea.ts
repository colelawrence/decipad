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

      textarea.addEventListener('keypress', adjustHeight);

      adjustHeight();

      return () => {
        textarea.removeEventListener('keypress', adjustHeight);
      };
    }, [textareaRef]);

    return textareaRef;
  };
