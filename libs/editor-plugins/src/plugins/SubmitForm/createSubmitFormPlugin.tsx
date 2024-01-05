import { SubmitForm } from '@decipad/editor-components';
import {
  ELEMENT_SUBMIT_FORM,
  createTPluginFactory,
} from '@decipad/editor-types';

export const createSubmitFormPlugin = createTPluginFactory({
  key: ELEMENT_SUBMIT_FORM,
  isElement: true,
  isVoid: true,
  component: SubmitForm,
});
