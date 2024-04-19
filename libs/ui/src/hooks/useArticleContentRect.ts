/* eslint decipad/css-prop-named-variable: 0 */
import { useAnnotations } from '@decipad/react-contexts';
import { useEffect, useState } from 'react';

export const useArticleContentRect = () => {
  // This is hacky, but it's a consequence of the least-hacky way we can get comments to float alongside their blocks.
  const { articleRef } = useAnnotations();

  const [contentRect, setContentRect] = useState<DOMRectReadOnly | null>(null);

  useEffect(() => {
    if (!articleRef?.current) {
      return;
    }
    setContentRect(articleRef.current.getBoundingClientRect());
    const resizeObserver = new ResizeObserver((entries) => {
      setContentRect(entries[0].target.getBoundingClientRect());
    });
    resizeObserver.observe(articleRef.current);

    return () => resizeObserver.disconnect();
  }, [articleRef]);

  return contentRect;
};
