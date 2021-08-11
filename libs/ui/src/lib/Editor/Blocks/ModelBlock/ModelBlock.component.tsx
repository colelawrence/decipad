import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { Result } from './Result.component';

const modelBlockStyles = css({
  borderRadius: '16px',
  padding: '24px',
  backgroundColor: 'rgba(240, 240, 242, 0.2)',
  border: '1px solid #F0F0F2',
  lineHeight: '2.5',
  margin: '16px 0',
  fontFamily: 'monospace',
  boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
});

export const ModelBlockElement: PlatePluginComponent = ({
  attributes,
  children,
  element,
}) => {
  const blockId = (element as any).id ?? '';

  return (
    <div spellCheck={false}>
      <pre css={modelBlockStyles} {...attributes}>
        {children}
      </pre>
      {blockId && <Result blockId={blockId} />}
    </div>
  );
};
