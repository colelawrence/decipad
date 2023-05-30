/* eslint decipad/css-prop-named-variable: 0 */
import { DropLineDirection } from '@udecode/plate-dnd';
import { DropLine } from './DropLine';
import { dropLineWidth } from '../../styles/drop-line';

export const RowDropLine = ({ dropLine }: { dropLine: DropLineDirection }) => {
  return (
    <div
      contentEditable={false}
      css={{
        position: 'absolute',
        top: dropLine === 'top' ? -(dropLineWidth / 2) - 0.5 : undefined,
        left: 0,
        bottom: dropLine === 'bottom' ? -(dropLineWidth / 2) - 1 : undefined,
        width: 'calc(100% + 1px)',
        zIndex: 2,
      }}
    >
      <DropLine variant="table" />
    </div>
  );
};
