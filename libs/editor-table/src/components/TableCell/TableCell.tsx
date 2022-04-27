import { PlateComponent, ELEMENT_TH, ELEMENT_TD } from '@decipad/editor-types';
import { atoms } from '@decipad/ui';

export const TableCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  const type = element?.type;
  if (!element || (type !== ELEMENT_TH && type !== ELEMENT_TD)) {
    throw new Error(
      `TableCell is meant to render table cells, not ${element?.type}`
    );
  }
  return (
    <atoms.TableData as="td" attributes={attributes} isEditable>
      {children}
    </atoms.TableData>
  );
};
