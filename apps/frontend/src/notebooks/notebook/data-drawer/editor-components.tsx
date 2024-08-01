import { useSimpleValueInfo } from '@decipad/editor-components';
import { ELEMENT_CODE_LINE_V2, PlateComponent } from '@decipad/editor-types';
import { assertElementType, getCodeLineSource } from '@decipad/editor-utils';
import { Children, useMemo } from 'react';
import { useDataDrawerContext } from './types';
import { parseExpression } from '@decipad/remote-computer';
import { useResolved } from '@decipad/react-utils';
import {
  DataDrawerCodeWrapper,
  DataDrawerEditor,
  DataDrawerNameWrapper,
  FormulaUnitDrawer,
} from './styles';
import { CodeResult, StructuredInputUnits, cssVar } from '@decipad/ui';
import { Formula } from 'libs/ui/src/icons';
import { getNodeString } from '@udecode/plate-common';

export const DataDrawerEditingComponent: PlateComponent = ({
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2);

  const { computer } = useDataDrawerContext();
  const [varName, code] = Children.toArray(children);

  const codeLineSource = getCodeLineSource(element.children[1]);
  const isEmpty = codeLineSource.trim().length === 0;

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

  return (
    <DataDrawerEditor spellCheck={false}>
      <DataDrawerNameWrapper>
        <div
          css={{
            '::before': {
              content:
                getNodeString(element.children[0]).length === 0
                  ? '"Enter name..."'
                  : '""',
              position: 'absolute',
              color: cssVar('textDisabled'),
            },
          }}
        >
          {varName}
        </div>
        <div contentEditable={false}>
          {isSimpleValue ? (
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
          )}
        </div>
      </DataDrawerNameWrapper>
      <DataDrawerCodeWrapper>
        <div>{code}</div>
        {result && !isEmpty && (
          <aside contentEditable={false}>
            <CodeResult {...result} />
          </aside>
        )}
      </DataDrawerCodeWrapper>
    </DataDrawerEditor>
  );
};
