import {
  getSlatePluginType,
  MARK_CODE,
  ToolbarMark,
  useEventEditorId,
  useStoreEditorRef,
} from '@udecode/slate-plugins';
import { FiCode } from 'react-icons/fi';
import { BlockTypeButton } from './BlockTypeButton';
import { Divider } from './Divider';
import { TextFormattingOptions } from './TextFormattingOptions';
import { toolbarButtonStyles } from './toolbarButtonStyles';
import { ToolbarWrapper } from './ToolbarWrapper/ToolbarWrapper.component';
import { tooltip } from './tooltipOptions';

export const FormattingToolbar = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <ToolbarWrapper>
      <BlockTypeButton />
      <Divider />
      <TextFormattingOptions />
      <Divider />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_CODE)}
        icon={<FiCode />}
        tooltip={{ content: 'Inline Code', ...tooltip }}
        styles={toolbarButtonStyles}
      />
    </ToolbarWrapper>
  );
};
