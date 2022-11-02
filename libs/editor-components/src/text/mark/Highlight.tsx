import { PlateComponent } from '@decipad/editor-types';
import { useEditorStylesContext } from '@decipad/react-contexts';
import { AvailableSwatchColor, Highlight as UIHighlight } from '@decipad/ui';

export const Highlight: PlateComponent = ({ attributes, children }) => {
  const { color: defaultColor } = useEditorStylesContext();

  return (
    <span {...attributes}>
      <UIHighlight color={defaultColor as AvailableSwatchColor}>
        {children}
      </UIHighlight>
    </span>
  );
};
