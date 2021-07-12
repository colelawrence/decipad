import styled from '@emotion/styled';
import { TippyProps } from '@tippyjs/react';
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
  getSlatePluginType,
  ToolbarAlign,
  ToolbarCodeBlock,
  useEventEditorId,
  useStoreEditorRef,
} from '@udecode/slate-plugins';
import React from 'react';
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiCode,
} from 'react-icons/fi';

const SideTools = styled('div')`
  position: fixed;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  border: 1px solid #f0f0f2;
  box-shadow: 0px 2px 24px rgba(36, 36, 41, 0.06);
  border-radius: 8px;
`;

const ButtonStyling = {
  root: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.2s ease-out',
    '&:hover': {
      backgroundColor: '#f0f0f2',
    },
  },
};

const tooltipOptions: TippyProps = {
  placement: 'left-start',
  theme: 'light',
};

export const SideFormattingMenu = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));
  return (
    <SideTools>
      <ToolbarCodeBlock
        styles={{ ...ButtonStyling }}
        tooltip={{
          ...tooltipOptions,
          content: 'Model block',
        }}
        icon={<FiCode />}
      />

      <ToolbarAlign
        type={getSlatePluginType(editor, ELEMENT_ALIGN_LEFT)}
        icon={<FiAlignLeft fontSize="20px" />}
        tooltip={{
          ...tooltipOptions,
          content: 'Left align',
        }}
        styles={{ ...ButtonStyling }}
      />
      <ToolbarAlign
        type={getSlatePluginType(editor, ELEMENT_ALIGN_CENTER)}
        icon={<FiAlignCenter fontSize="20px" />}
        tooltip={{
          ...tooltipOptions,
          content: 'Center align',
        }}
        styles={{ ...ButtonStyling }}
      />
      <ToolbarAlign
        type={getSlatePluginType(editor, ELEMENT_ALIGN_RIGHT)}
        icon={<FiAlignRight fontSize="20px" />}
        tooltip={{
          ...tooltipOptions,
          content: 'Right align',
        }}
        styles={{ ...ButtonStyling }}
      />
    </SideTools>
  );
};
