import { RefObject, useEffect } from 'react';

export const useTextAreaAutoFocus = (ref: RefObject<HTMLTextAreaElement>) => {
  const element = ref.current;

  useEffect(() => {
    if (!element) return;

    element.focus();
    moveCaretToTheEnd(element);
  }, [element]);
};

const moveCaretToTheEnd = (el: HTMLTextAreaElement) => {
  const original = el.value;
  // eslint-disable-next-line no-param-reassign
  el.value = '';
  // eslint-disable-next-line no-param-reassign
  el.value = original;
};
