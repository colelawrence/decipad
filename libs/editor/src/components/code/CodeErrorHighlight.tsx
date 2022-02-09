import { molecules } from '@decipad/ui';
import { ComponentProps } from 'react';
import { PlateComponent } from '../../types';

export const CodeErrorHighlight: PlateComponent<
  Pick<ComponentProps<typeof molecules.CodeSyntaxErrorHighlight>, 'variant'>
> = ({ attributes, children, variant }) => {
  return (
    <span {...attributes}>
      <molecules.CodeSyntaxErrorHighlight variant={variant}>
        {children}
      </molecules.CodeSyntaxErrorHighlight>
    </span>
  );
};
