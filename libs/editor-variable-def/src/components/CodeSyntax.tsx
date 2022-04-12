import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { CodeSyntaxRange } from '../utils/decorateExpression';

export const CodeSyntax: PlateComponent = ({ attributes, children, leaf }) => {
  return (
    <span {...attributes}>
      <atoms.CodeSyntax
        variant={
          (leaf as unknown as CodeSyntaxRange).tokenType as
            | 'number'
            | 'identifier'
        }
      >
        {children}
      </atoms.CodeSyntax>
    </span>
  );
};
