import { molecules } from '@decipad/ui';
import { ComponentProps } from 'react';
import { PlateComponent } from '@decipad/editor-types';

export type SyntaxErrorHighlightProps = Pick<
  ComponentProps<typeof molecules.SyntaxErrorHighlight>,
  'variant' | 'error'
>;

export const SyntaxErrorHighlight: PlateComponent<
  SyntaxErrorHighlightProps
> = ({ attributes, children, variant, error }) => {
  return (
    <span {...attributes}>
      <molecules.SyntaxErrorHighlight variant={variant} error={error}>
        {children}
      </molecules.SyntaxErrorHighlight>
    </span>
  );
};
