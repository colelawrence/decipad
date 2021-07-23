import {
  getSlatePluginType,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  ToolbarMark,
  useEventEditorId,
  useStoreEditorRef,
} from '@udecode/slate-plugins';
import { FiBold, FiItalic, FiUnderline } from 'react-icons/fi';
import { toolbarButtonStyles } from '../toolbarButtonStyles';
import { tooltip } from '../tooltipOptions';

export const TextFormattingOptions = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));
  return (
    <>
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_BOLD)}
        icon={<FiBold />}
        tooltip={{ content: 'Bold (⌘B)', ...tooltip }}
        styles={toolbarButtonStyles}
      />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_ITALIC)}
        icon={<FiItalic />}
        tooltip={{ content: 'Italic (⌘I)', ...tooltip }}
        styles={toolbarButtonStyles}
      />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_UNDERLINE)}
        icon={<FiUnderline />}
        tooltip={{ content: 'Underline (⌘U)', ...tooltip }}
        styles={toolbarButtonStyles}
      />
    </>
  );
};
