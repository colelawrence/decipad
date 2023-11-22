import { ELEMENT_LINK, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { Link as UILink } from '@decipad/ui';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { useLink } from '@udecode/plate-link';

export const Link: PlateComponent = (props) => {
  const { children, element } = props;
  assertElementType(element, ELEMENT_LINK);
  const readOnly = useIsEditorReadOnly();

  const { props: linkProps } = useLink({ element: props.element as any });

  return (
    <UILink
      {...linkProps}
      color="default"
      onClick={(e) => !readOnly && e.preventDefault()}
    >
      {children}
    </UILink>
  );
};
