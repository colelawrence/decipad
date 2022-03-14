import { types } from '@decipad/editor-config';
import { molecules } from '@decipad/ui';
import { ComponentProps } from 'react';

export const CodeErrorHighlight: types.PlateComponent<
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
