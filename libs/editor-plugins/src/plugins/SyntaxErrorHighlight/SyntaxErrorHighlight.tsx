import { SyntaxErrorHighlight as UISyntaxErrorHighlight } from '@decipad/ui';
import type { ComponentProps } from 'react';
import type { PlateComponent } from '@decipad/editor-types';
import { useDelayedTrue } from '@decipad/react-utils';

export type SyntaxErrorHighlightProps = Pick<
  ComponentProps<typeof UISyntaxErrorHighlight>,
  'variant' | 'error'
>;

export const SyntaxErrorHighlight: PlateComponent<
  SyntaxErrorHighlightProps
> = ({ attributes, children, variant, error }) => {
  const errorsVisible = useDelayedTrue(true);

  return (
    <span {...attributes}>
      <UISyntaxErrorHighlight
        hideError={!errorsVisible}
        variant={variant}
        error={error}
      >
        {children}
      </UISyntaxErrorHighlight>
    </span>
  );
};
