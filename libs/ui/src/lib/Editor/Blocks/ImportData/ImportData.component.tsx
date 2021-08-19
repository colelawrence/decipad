import { useContext } from 'react';
import { css } from '@emotion/react';
import { SPRenderElementProps, PlatePluginComponent } from '@udecode/plate';
import { Result } from '../Result/Result.component';
import { ImportDataIconElement } from './ImportDataIcon.component';

import {
  ProgramBlocksContext,
  ProgramBlocksContextValue,
} from '../../../Contexts';

interface ExtendedElementProps {
  'data-href'?: string;
  'data-contenttype'?: string;
  'data-varname'?: string;
}

export type ImportDataElementProps = SPRenderElementProps<ExtendedElementProps>;

const styles = css({
  borderRadius: '16px',
  padding: '12px',
  backgroundColor: 'rgba(140, 240, 142, 0.2)',
  border: '1px solid #F0F0F2',
  lineHeight: '2.5',
  margin: '16px 0',
  fontFamily: 'monospace',
  boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
});

export const ELEMENT_IMPORT_DATA = 'import-data';

export const ImportDataElement: PlatePluginComponent = (props) => {
  const blocks = useContext<ProgramBlocksContextValue>(ProgramBlocksContext);

  const { attributes, element } = props as ImportDataElementProps;
  const { id: blockId } = element;
  const {
    'data-href': href,
    'data-contenttype': contentType,
    'data-varname': varName,
  } = element;
  return (
    <div {...attributes} contentEditable={false} css={styles}>
      <ImportDataIconElement contentType={contentType} />
      <label htmlFor={`${blockId}:varname`}>var name = </label>
      <input
        id={`${blockId}:varname`}
        type="text"
        onChange={(event) => {
          if (blocks && blocks.setBlockVarName) {
            blocks?.setBlockVarName(blockId, event.target.value);
          }
        }}
        value={varName}
      />
      <pre {...attributes}>
        Import data ( varName="{varName}" contentType="{contentType}" href="
        {href && href.substring(0, 10)}...")
      </pre>
      {blockId && <Result blockId={blockId} />}
    </div>
  );
};
