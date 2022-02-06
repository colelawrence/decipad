import { molecules } from '@decipad/ui';
import { ANNOTATION_SYNTAX_ERROR } from '../../annotations';
import { PlateComponent } from '../../types';

export const CodeErrorHighlight: PlateComponent = ({
  attributes,
  children,
  leaf,
}) => {
  if (
    leaf == null ||
    !('type' in leaf) ||
    leaf.type !== ANNOTATION_SYNTAX_ERROR
  ) {
    throw new Error(
      'CodeErrorHighlight is meant to render syntax error elements'
    );
  }

  return (
    <span {...attributes}>
      <molecules.CodeSyntaxErrorHighlight variant={leaf.variant}>
        {children}
      </molecules.CodeSyntaxErrorHighlight>
    </span>
  );
};
