/* eslint decipad/css-prop-named-variable: 0 */
import { ComponentProps } from 'react';
import { Display, Divider } from '../../atoms';

export const EditorTitle = (
  props: ComponentProps<typeof Display>
): ReturnType<React.FC> => {
  return (
    <div
      css={{
        display: 'grid',
        rowGap: '24px',
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
