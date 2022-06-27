import { molecules } from '@decipad/ui';
import { ComponentProps } from 'react';
import { PlateComponent } from '@decipad/editor-types';

type CodeErrorHighlightProps = Pick<
  ComponentProps<typeof molecules.CodeSyntaxErrorHighlight>,
  'variant'
> & {
  error?: string;
};

export const CodeErrorHighlight: PlateComponent<CodeErrorHighlightProps> = ({
  attributes,
  children,
  variant,
  error,
}) => {
  return (
    <span {...attributes}>
      <molecules.CodeSyntaxErrorHighlight variant={variant} error={error}>
        {children}
      </molecules.CodeSyntaxErrorHighlight>
    </span>
  );
};
