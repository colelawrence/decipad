import { SubmitForm } from '@decipad/editor-components';
import {
  createMyPluginFactory,
  ELEMENT_SUBMIT_FORM,
} from '@decipad/editor-types';

export const createSubmitFormPlugin = createMyPluginFactory({
  key: ELEMENT_SUBMIT_FORM,
  isElement: true,
  isVoid: true,
  component: SubmitForm,
});
