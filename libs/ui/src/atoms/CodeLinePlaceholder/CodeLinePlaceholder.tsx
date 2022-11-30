import { cssVar } from '../../primitives';

export const CodeLinePlaceholder: React.FC<{ height: number }> = ({
  height,
}) => (
  <div
    css={{
      opacity: 0.6,
      borderRadius: '10px',
      height: `${height}px`,

      border: `1px solid ${cssVar('strongHighlightColor')}`,
      backgroundColor: cssVar('highlightColor'),
    }}
  >
    &nbsp;
  </div>
);
