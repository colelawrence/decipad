import { DropLineDirection } from '@udecode/plate';
import { DropLine } from './DropLine';
import { dropLineWidth } from '../../styles/drop-line';

export const RowDropLine = ({ dropLine }: { dropLine: DropLineDirection }) => {
  return (
    <div
      contentEditable={false}
      css={{
        position: 'absolute',
        top: dropLine === 'top' ? -(dropLineWidth / 2) - 0.5 : undefined,
        bottom: dropLine === 'bottom' ? -(dropLineWidth / 2) - 1 : undefined,
        width: 'calc(100% + 1px)',
        zIndex: 1,
      }}
    >
      <DropLine variant="table" />
    </div>
  );
};
