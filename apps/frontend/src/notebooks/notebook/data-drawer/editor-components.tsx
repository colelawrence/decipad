import {
  useAutoConvertToSmartRef,
  useSimpleValueInfo,
} from '@decipad/editor-components';
import { ELEMENT_CODE_LINE_V2, PlateComponent } from '@decipad/editor-types';
import { assertElementType, getCodeLineSource } from '@decipad/editor-utils';
import { Children, useMemo } from 'react';
import { useDataDrawerCreatingCallback } from './types';
import { parseExpression } from '@decipad/remote-computer';
import { useResolved } from '@decipad/react-utils';
import {
  DataDrawerCodeWrapper,
  DataDrawerEditor,
  DataDrawerInputWrapper,
  DataDrawerNameWrapper,
  FormulaUnitDrawer,
  PaddingDiv,
} from './styles';
import { CodeResult, StructuredInputUnits, cssVar } from '@decipad/ui';
import { Enter, Formula } from 'libs/ui/src/icons';
import { getNodeString } from '@udecode/plate-common';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { assert } from '@decipad/utils';

export const DataDrawerEditingComponent: PlateComponent = ({
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2);

  const [computer, isEditing] = useNotebookWithIdState(
    (s) => [s.computer, s.dataDrawerMode.type === 'edit'] as const
  );
  assert(computer != null, 'unreachable: computer cannot be null here.');

  const [varName, code] = Children.toArray(children);

  const onSubmitCreate = useDataDrawerCreatingCallback();

  const codeLineSource = getCodeLineSource(element.children[1]);
  const isEmpty = codeLineSource.trim().length === 0;

  useAutoConvertToSmartRef(element.children[1]);

  const { simpleValue, onChangeUnit } = useSimpleValueInfo(
    computer,
    element,
    codeLineSource
  );
  const isSimpleValue = Boolean(simpleValue);

  const expression = useMemo(() => {
    const parsedExpression = parseExpression(codeLineSource);
    if (parsedExpression.solution == null) {
      return undefined;
    }

    return parsedExpression.solution;
  }, [codeLineSource]);

  const result = useResolved(
    useMemo(() => {
      if (expression == null) {
        return undefined;
      }

      return computer.expressionResult(expression);
    }, [computer, expression])
  );

  const isNameEmpty = getNodeString(element.children[0]).length === 0;

  const unit = isSimpleValue ? (
    <StructuredInputUnits
      unit={simpleValue?.unit ?? expression}
      onChangeUnit={simpleValue ? onChangeUnit : () => {}}
      readOnly={false}
      variant="colourful"
    />
  ) : (
    <FormulaUnitDrawer>
      <Formula /> <span>Formula</span>
    </FormulaUnitDrawer>
  );

  return (
    <DataDrawerEditor spellCheck={false} data-testid="data-drawer-wrapper">
      <DataDrawerNameWrapper>
        <div
          css={{
            '::before': {
              cursor: 'text',
              content: isNameEmpty ? '"Name your calculation"' : '""',
              position: 'absolute',
              color: cssVar('textDisabled'),
            },
          }}
        >
          {varName}
        </div>
        <DataDrawerInputWrapper
          contentEditable={false}
          data-testid="data-drawer-unit-picker"
        >
          {unit}
        </DataDrawerInputWrapper>
      </DataDrawerNameWrapper>
      <DataDrawerCodeWrapper>
        <div data-testid="data-drawer">{code}</div>
        {result && !isEmpty && (
          <aside
            contentEditable={false}
            data-testid={`data-drawer-result:${String(result.value)}`}
          >
            <CodeResult {...result} variant="inline" />
            {!isEditing ? <Enter onClick={onSubmitCreate} /> : <PaddingDiv />}
          </aside>
        )}
      </DataDrawerCodeWrapper>
    </DataDrawerEditor>
  );
};
