import { SyntaxErrorHighlight as UISyntaxErrorHighlight } from '@decipad/ui';
import { ComponentProps } from 'react';
import { PlateComponent } from '@decipad/editor-types';

export type SyntaxErrorHighlightProps = Pick<
  ComponentProps<typeof UISyntaxErrorHighlight>,
  'variant' | 'error'
>;

export const SyntaxErrorHighlight: PlateComponent<
  SyntaxErrorHighlightProps
> = ({ attributes, children, variant, error }) => {
  return (
    <span {...attributes}>
      <UISyntaxErrorHighlight variant={variant} error={error}>
        {children}
      </UISyntaxErrorHighlight>
    </span>
  );
};
