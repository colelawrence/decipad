import { PlateComponent } from '@decipad/editor-types';
import { atoms } from '@decipad/ui';
import { useSelected } from 'slate-react';
import { DecorationCellUnit } from '../../types';

export const TableCellUnitLeaf: PlateComponent = (props) => {
  const focused = useSelected();
  const { attributes, leaf } = props;
  const l = leaf as unknown as DecorationCellUnit;

  return (
    <div {...attributes}>
      <atoms.TableCellWithUnit
        unit={leaf?.text && l.unitString}
        showUnit={!focused}
      >
        {props.children}
      </atoms.TableCellWithUnit>
    </div>
  );
};
