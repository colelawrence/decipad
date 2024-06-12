/* eslint decipad/css-prop-named-variable: 0 */
import { DropLineDirection } from '@udecode/plate-dnd';
import { TableDropLine } from './TableDropLine';
import { dropLineThickness } from '../../../styles/drop-line';

// FIXME: Unused
export const RowDropLine = ({ dropLine }: { dropLine: DropLineDirection }) => {
  return (
    <div
      contentEditable={false}
      css={{
        position: 'absolute',
        top: dropLine === 'top' ? -(dropLineThickness / 2) - 0.5 : undefined,
        left: 0,
        bottom:
          dropLine === 'bottom' ? -(dropLineThickness / 2) - 1 : undefined,
        width: 'calc(100% + 1px)',
        zIndex: 2,
      }}
    >
      <TableDropLine variant="row" />
    </div>
  );
};
