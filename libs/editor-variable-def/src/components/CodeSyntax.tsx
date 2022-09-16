import { CodeSyntax as UICodeSyntax } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { CodeSyntaxRange } from '../utils/decorateExpression';

export const CodeSyntax: PlateComponent = ({ attributes, children, leaf }) => {
  return (
    <span {...attributes}>
      <UICodeSyntax
        variant={
          (leaf as unknown as CodeSyntaxRange).tokenType as
            | 'number'
            | 'identifier'
        }
      >
        {children}
      </UICodeSyntax>
    </span>
  );
};
