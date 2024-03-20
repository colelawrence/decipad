/* eslint decipad/css-prop-named-variable: 0 */
import { useContext, useEffect, useState } from 'react';
import { AnnotationsContext } from '@decipad/react-contexts';

export const useArticleContentRect = () => {
  // This is hacky, but it's a consequence of the least-hacky way we can get comments to float alongside their blocks.
  const ctx = useContext(AnnotationsContext);
  const articleRef = ctx?.articleRef;
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
