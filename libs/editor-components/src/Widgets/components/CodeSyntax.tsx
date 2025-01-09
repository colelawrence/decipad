import { CodeSyntax as UICodeSyntax } from '@decipad/ui';
import type { PlateComponent } from '@decipad/editor-types';
import type { CodeSyntaxRange } from '../utils/decorateExpression';
import { useVariableEditorContext } from './VariableEditorContext';

export const CodeSyntax: PlateComponent = ({ attributes, children, leaf }) => {
  const { color } = useVariableEditorContext();

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
        color={color}
      >
        {children}
      </UICodeSyntax>
    </span>
  );
};
