import type { Computer } from '@decipad/computer-interfaces';
import { parseStatement } from '@decipad/remote-computer';
import type {
  AnyElement,
  CodeLineElement,
  CodeLineV2Element,
  IntegrationTypes,
  StructuredInputElement,
  StructuredVarnameElement,
  TableElement,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_INTEGRATION,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate-common';
import { nanoid } from 'nanoid';

function deduplicateVarNameInDef(
  computer: Computer,
  e: VariableDefinitionElement
) {
  e.children[0].children[0].text = computer.getAvailableIdentifier(
    `${getNodeString(e.children[0])}Copy`
  );

  if (e.variant !== 'dropdown') {
    return;
  }

  for (const option of e.children[1].options) {
    option.id = nanoid();
  }
}

function deduplicateAssignmentVarName(computer: Computer, e: CodeLineElement) {
  const code = getNodeString(e);
  const parsed = parseStatement(code);
  if (!parsed.error && parsed.solution && parsed.solution.type === 'assign') {
    const varName = parsed.solution.args[0].args[0];
    const newVarName = computer.getAvailableIdentifier(`${varName}Copy`);
    e.children[0].text = code.replace(varName, newVarName);
  }
}

function deduplicateVarNameInCodeLineV2(
  computer: Computer,
  e: CodeLineV2Element
) {
  e.children[0].children[0].text = computer.getAvailableIdentifier(
    `${getNodeString(e.children[0])}Copy`
  );
}

function deduplicateVarNameInStructuredIn(
  computer: Computer,
  e: StructuredInputElement
) {
  e.children[0].children[0].text = computer.getAvailableIdentifier(
    `${getNodeString(e.children[0])}Copy`
  );
}

function deduplicateTableVarName(computer: Computer, e: TableElement) {
  const captionEl = e.children[0].children[0];
  const varName = getNodeString(captionEl);
  e.children[0].children[0].children[0].text = computer.getAvailableIdentifier(
    `${varName}Copy`
  );

  for (const tableHeader of e.children[1].children) {
    if (tableHeader.categoryValues == null) {
      continue;
    }

    for (const categoryValue of tableHeader.categoryValues) {
      categoryValue.id = nanoid();
    }
  }
}

function deduplicateIntegrationVarName(
  computer: Computer,
  e: IntegrationTypes.IntegrationBlock
): void {
  const structuredVarName: StructuredVarnameElement = e.children[0];
  const varName = getNodeString(structuredVarName);

  structuredVarName.children[0].text = computer.getAvailableIdentifier(
    `${varName}Copy`
  );
}

export const deduplicateVarNameInBlock = <T extends AnyElement>(
  computer: Computer,
  el: T
): T => {
  switch (el.type) {
    case ELEMENT_VARIABLE_DEF:
      deduplicateVarNameInDef(computer, el);
      break;
    case ELEMENT_CODE_LINE:
      deduplicateAssignmentVarName(computer, el);
      break;
    case ELEMENT_CODE_LINE_V2:
      deduplicateVarNameInCodeLineV2(computer, el);
      break;
    case ELEMENT_STRUCTURED_IN:
      deduplicateVarNameInStructuredIn(computer, el);
      break;
    case ELEMENT_TABLE:
      deduplicateTableVarName(computer, el);
      break;
    case ELEMENT_INTEGRATION:
      deduplicateIntegrationVarName(computer, el);
      break;
  }
  return el;
};
