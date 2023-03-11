import { SyntaxErrorHighlight as UISyntaxErrorHighlight } from '@decipad/ui';
import { ComponentProps } from 'react';
import { PlateComponent } from '@decipad/editor-types';
import { useDelayedTrue } from '@decipad/react-utils';

export type SyntaxErrorHighlightProps = Pick<
  ComponentProps<typeof UISyntaxErrorHighlight>,
  'variant' | 'error'
>;

export const TypeErrorHighlight: PlateComponent<SyntaxErrorHighlightProps> = ({
  attributes,
  children,
  error,
}) => {
  const showError = useDelayedTrue(true);
  return (
    <span {...attributes}>
      <UISyntaxErrorHighlight
        hideError={!showError}
        variant="custom"
        error={error}
      >
        {children}
      </UISyntaxErrorHighlight>
    </span>
  );
};
