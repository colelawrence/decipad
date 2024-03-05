/* eslint decipad/css-prop-named-variable: 0 */
import type { AutocompleteName } from '@decipad/remote-computer';
import { FC } from 'react';
import { hideOnPrint } from '../../../styles/editor-layout';
import { SelectInput } from '../../../shared/molecules/SelectInput/SelectInput';

interface VariableNameProps {
  label?: string;
  variableNames: AutocompleteName[];
  selectedVariableName?: string;
  onChangeVariableName: (varName: string) => void;
  testId?: string;
}

export const VariableNameSelector: FC<VariableNameProps> = ({
  label = 'Variable name',
  variableNames,
  selectedVariableName,
  onChangeVariableName,
  testId,
}) => {
  return (
    <div css={hideOnPrint} contentEditable={false} data-testid={testId}>
      <SelectInput
        labelText={label}
        value={selectedVariableName}
        setValue={onChangeVariableName}
      >
        <option key="empty" value={''}>
          Choose...
        </option>
        {variableNames.map((varName) => (
          <option key={varName.blockId} value={varName.blockId}>
            {varName.name}
          </option>
        ))}
      </SelectInput>
    </div>
  );
};
