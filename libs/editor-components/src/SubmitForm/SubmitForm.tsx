import { ELEMENT_SUBMIT_FORM, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { DraggableBlock } from '../block-management/index';
import { SubmitForm as SubmitFormComponent } from '@decipad/ui';

export const SubmitForm: PlateComponent = (props) => {
  assertElementType(props.element, ELEMENT_SUBMIT_FORM);

  return (
    <DraggableBlock blockKind="codeLine" element={props.element}>
      <SubmitFormComponent {...props} />
      <div style={{ display: 'none' }}>{props.children}</div>
    </DraggableBlock>
  );
};
