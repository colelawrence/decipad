import { ComponentProps } from 'react';
import { Display, Divider } from '../../atoms';
import { blockAlignment, editorLayout } from '../../styles';

export const EditorTitle = (
  props: ComponentProps<typeof Display>
): ReturnType<React.FC> => {
  return (
    <div
      css={{
        maxWidth: `${editorLayout.slimBlockWidth}px`,
        margin: 'auto',

        paddingBottom: '16px',

        display: 'grid',
        rowGap: '24px',
      }}
    >
      <div>
        <Display {...props} />
      </div>
      <div
        contentEditable={false}
        css={{ paddingTop: blockAlignment.divider.paddingTop }}
      >
        <Divider />
      </div>
    </div>
  );
};
