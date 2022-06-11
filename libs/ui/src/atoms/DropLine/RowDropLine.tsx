import { DropLineDirection } from '@udecode/plate';
import { DropLine, dropLineHeight } from './DropLine';

export const RowDropLine = ({ dropLine }: { dropLine: DropLineDirection }) => {
  return (
    <div
      contentEditable={false}
      css={{
        position: 'absolute',
        top: dropLine === 'top' ? -(dropLineHeight / 2) - 0.5 : undefined,
        bottom: dropLine === 'bottom' ? -(dropLineHeight / 2) - 1 : undefined,
        width: 'calc(100% + 1px)',
        zIndex: 1,
      }}
    >
      <DropLine variant="table" />
    </div>
  );
};
