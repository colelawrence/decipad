import { CodeSyntax as UICodeSyntax } from '@decipad/ui';
import type { PlateComponent } from '@decipad/editor-types';
import type { CodeSyntaxRange } from '../utils/decorateExpression';

export const CodeSyntax: PlateComponent = ({ attributes, children, leaf }) => {
  return (
    <span {...attributes}>
      <UICodeSyntax
        variant={
          (leaf as unknown as CodeSyntaxRange).tokenType as
            | 'number'
            | 'identifier'
            | 'date'
            | 'string'
        }
      >
        {children}
      </UICodeSyntax>
    </span>
  );
};
