import { PlateComponent } from '@decipad/editor-types';
import { atoms } from '@decipad/ui';
import { DecorationCellUnit } from '../../types';

export const TableCellUnitLeaf: PlateComponent = (props) => {
  const { attributes, leaf } = props;
  const l = leaf as unknown as DecorationCellUnit;

  return (
    <div {...attributes}>
      <atoms.TableCellWithUnit unit={leaf?.text && l.unitString}>
        {props.children}
      </atoms.TableCellWithUnit>
    </div>
  );
};
