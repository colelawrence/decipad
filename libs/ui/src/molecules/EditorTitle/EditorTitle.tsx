import { ComponentProps } from 'react';
import { Display, Divider } from '../../atoms';
import { editorLayout } from '../../styles';

export const EditorTitle = (
  props: ComponentProps<typeof Display>
): ReturnType<React.FC> => {
  return (
    <div
      css={{
        paddingBottom: '16px',
        maxWidth: `${editorLayout.slimBlockWidth}px`,
        margin: 'auto',
        justifyContent: 'center',
      }}
    >
      <div>
        <Display {...props} />
      </div>
      <div contentEditable={false}>
        <Divider />
      </div>
    </div>
  );
};
