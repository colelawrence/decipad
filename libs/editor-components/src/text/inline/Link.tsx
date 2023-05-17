import { ELEMENT_LINK, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { Link as UILink } from '@decipad/ui';
import { useLink } from '@udecode/plate';
import { useIsEditorReadOnly } from '@decipad/react-contexts';

export const Link: PlateComponent = (props) => {
  const { children, element } = props;
  assertElementType(element, ELEMENT_LINK);
  const readOnly = useIsEditorReadOnly();

  const htmlProps = useLink({
    ...(props as any),
    onClick: (e) => !readOnly && e.preventDefault(),
  });

  return (
    <UILink {...htmlProps} color="default">
      {children}
    </UILink>
  );
};
