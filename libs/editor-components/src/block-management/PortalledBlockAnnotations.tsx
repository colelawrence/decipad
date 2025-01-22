import { FC, ComponentProps } from 'react';
import { useAnnotations } from '@decipad/notebook-state';
import { createPortal } from 'react-dom';
import { BlockAnnotations } from '@decipad/ui';

export const PortalledBlockAnnotations: FC<
  ComponentProps<typeof BlockAnnotations>
> = (props) => {
  // this is just here to update the re-render so we can portal in safely.
  useAnnotations();

  const annotationsContainer = document.getElementById('annotations-container');

  if (annotationsContainer == null) {
    return null;
  }

  return (
    annotationsContainer &&
    createPortal(<BlockAnnotations {...props} />, annotationsContainer)
  );
};
