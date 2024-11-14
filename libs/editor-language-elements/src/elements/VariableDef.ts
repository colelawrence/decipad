import type { VariableDropdownElement } from '@decipad/editor-types';
import { ELEMENT_VARIABLE_DEF } from '@decipad/editor-types';
import type { Computer, Program } from '@decipad/computer-interfaces';
import type { AST } from '@decipad/language-interfaces';
import { getNodeString } from '@udecode/plate-common';
import { assertElementType } from '@decipad/editor-utils';
import { inferType, parseCell } from '@decipad/parse';
import { getDefined } from '@decipad/utils';
import { getExprRef } from '@decipad/remote-computer';
import type { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';

export const VariableDef: InteractiveLanguageElement = {
  type: ELEMENT_VARIABLE_DEF,
  getParsedBlockFromElement: async (
    _editor,
    computer,
    element
  ): Promise<Program> => {
    assertElementType(element, ELEMENT_VARIABLE_DEF);

    if (element.children.length < 2) {
      return [];
    }

    const { id, children } = element;
    const variableName = getNodeString(children[0]);
    let expression: string | AST.Expression = getNodeString(children[1]);
    const isSmartSelection = !!children[1].smartSelection;

    if (
      element.variant === 'expression' ||
      element.variant === 'date' ||
      element.variant === 'toggle' ||
      (element.variant === 'dropdown' && !isSmartSelection)
    ) {
      const { type, coerced } = await inferType(computer, expression, {
        type: element.coerceToType,
      });
      if (type.kind === 'anything' || type.kind === 'nothing') {
        expression = {
          type: 'noop',
          args: [],
        };
      } else {
        expression = coerced || '';
      }
      if (element.variant === 'dropdown') {
        const dropdownVariable = parseElementAsVariableAssignment(
          id ?? '',
          variableName,
          expression
        );
        const dropdownOptions = await parseDropdownOptions(computer, element);
        return [...dropdownVariable, ...dropdownOptions.flat()];
      }
    }

    if (element.variant === 'dropdown' && isSmartSelection) {
      return parseDropdown(computer, element);
    }

    return parseElementAsVariableAssignment(id ?? '', variableName, expression);
  },
};

/**
 * A normal dropdown widget.
 */
async function parseDropdown(
  computer: Computer,
  element: VariableDropdownElement
): Promise<Program> {
  const [name, expression] = element.children.map((c) => getNodeString(c));

  const parsedOptions = await parseDropdownOptions(computer, element);

  let parsedInput: AST.Expression | Error | null = null;
  try {
    parsedInput = await parseCell(
      computer,
      element.coerceToType ?? {
        kind: 'number',
        unit: null,
      },
      expression
    );
  } catch (err) {
    // do nothing
  }
  if (!(parsedInput instanceof Error || parsedInput == null)) {
    return [
      ...parseElementAsVariableAssignment(element.id, name, parsedInput),
      ...parsedOptions,
    ];
  }

  return [];
}

async function parseDropdownOptions(
  computer: Computer,
  element: VariableDropdownElement
): Promise<Program> {
  const [, dropdown] = element.children;

  const dropdownOptions = await Promise.all(
    dropdown.options.map(async (option) => {
      let dropdownExpression: string | AST.Expression;
      const dropdownType = await inferType(computer, option.value, {
        type: element.coerceToType,
      });
      if (
        dropdownType.type.kind === 'anything' ||
        dropdownType.type.kind === 'nothing'
      ) {
        dropdownExpression = {
          type: 'noop',
          args: [],
        };
      } else {
        dropdownExpression = getDefined(dropdownType.coerced);
      }
      return parseElementAsVariableAssignment(
        option.id,
        getExprRef(option.id),
        dropdownExpression,
        true, // isArtificial
        [element.id] // origin block id
      );
    })
  );

  return dropdownOptions.flat();
}
