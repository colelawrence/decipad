import {
  BalloonToolbar,
  getSlatePluginType,
  MARK_CODE,
  ToolbarMark,
  useEventEditorId,
  useStoreEditorRef,
} from '@udecode/slate-plugins';
import React from 'react';
import { FiCode } from 'react-icons/fi';
import { BlockTypeButton } from './BlockTypeButton';
import { Divider } from './Divider';
import { TextFormattingOptions } from './TextFormattingOptions';
import { toolbarButtonStyles } from './toolbarButtonStyles';
import { tooltip } from './tooltipOptions';

export const FormattingToolbar = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  const arrow = false;
  const theme = 'light';
  const direction = 'top';
  const hiddenDelay = 0;

  return (
    <BalloonToolbar
      arrow={arrow}
      theme={theme}
      direction={direction}
      hiddenDelay={hiddenDelay}
      styles={{
        root: {
          background: 'white',
          boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
          borderRadius: '6px',
          border: '1px solid #f0f0f2 !important',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
        },
      }}
    >
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
    </BalloonToolbar>
  );
};
