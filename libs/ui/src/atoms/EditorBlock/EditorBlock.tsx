import { ReactNode } from 'react';
import { blockAlignment } from '../../styles';

interface EditorBlockProps {
  readonly blockKind: keyof typeof blockAlignment;
  readonly children: ReactNode;
}

export const EditorBlock: React.FC<EditorBlockProps> = ({
  blockKind,
  children,
}) => {
  const { desiredWidth } = blockAlignment[blockKind];
  return (
    <div
      css={{
        maxWidth: desiredWidth,
        margin: 'auto',

        display: 'grid',
      }}
    >
      {children}
    </div>
  );
};
